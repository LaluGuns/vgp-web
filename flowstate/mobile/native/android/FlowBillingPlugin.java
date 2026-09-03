package com.virzyguns.flow;

import android.app.Activity;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryProductDetailsResult;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "FlowBilling")
public class FlowBillingPlugin extends Plugin implements PurchasesUpdatedListener {
  private BillingClient billingClient;
  private boolean connecting = false;
  private final List<PendingAction> pendingActions = new ArrayList<>();
  private PluginCall activePurchaseCall;

  private interface ReadyAction { void run(); }
  private static class PendingAction {
    final PluginCall call;
    final ReadyAction action;
    PendingAction(PluginCall call, ReadyAction action) { this.call = call; this.action = action; }
  }

  @Override
  public void load() {
    super.load();
    billingClient = BillingClient.newBuilder(getContext())
      .setListener(this)
      .enablePendingPurchases(
        PendingPurchasesParams.newBuilder()
          .enableOneTimeProducts()
          .enablePrepaidPlans()
          .build()
      )
      .enableAutoServiceReconnection()
      .build();
    connectIfNeeded();
  }

  @Override
  protected void handleOnDestroy() {
    if (billingClient != null) billingClient.endConnection();
    billingClient = null;
    pendingActions.clear();
    if (activePurchaseCall != null) {
      activePurchaseCall.reject("Billing flow ended because the activity was destroyed");
      activePurchaseCall = null;
    }
    super.handleOnDestroy();
  }

  @PluginMethod
  public void getProducts(PluginCall call) {
    List<String> productIds = readStringArray(call.getArray("productIds"));
    if (productIds.isEmpty()) {
      call.reject("productIds is required");
      return;
    }
    whenReady(call, () -> queryProducts(productIds, call));
  }

  @PluginMethod
  public void purchase(PluginCall call) {
    String productId = clean(call.getString("productId"));
    String basePlanId = clean(call.getString("basePlanId"));
    String offerId = clean(call.getString("offerId"));
    String accountId = clean(call.getString("obfuscatedAccountId"));
    String oldPurchaseToken = clean(call.getString("oldPurchaseToken"));
    String oldProductId = clean(call.getString("oldProductId"));
    String replacementMode = clean(call.getString("replacementMode"));

    if (productId == null || basePlanId == null) {
      call.reject("productId and basePlanId are required for Flow subscriptions");
      return;
    }
    if (accountId == null || !accountId.matches("^[a-fA-F0-9]{64}$")) {
      call.reject("obfuscatedAccountId must be the exact 64-character server-derived SHA-256 value");
      return;
    }
    if ((oldPurchaseToken == null) != (oldProductId == null)) {
      call.reject("oldPurchaseToken and oldProductId must be provided together for subscription replacement");
      return;
    }
    if (activePurchaseCall != null) {
      call.reject("Another Play billing flow is already active");
      return;
    }

    whenReady(call, () -> querySingleProductForPurchase(
      productId,
      basePlanId,
      offerId,
      accountId,
      oldPurchaseToken,
      oldProductId,
      replacementMode,
      call
    ));
  }

  @PluginMethod
  public void restore(PluginCall call) {
    whenReady(call, () -> {
      QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
        .setProductType(BillingClient.ProductType.SUBS)
        .build();
      billingClient.queryPurchasesAsync(params, (billingResult, purchases) -> {
        if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
          call.reject("Unable to query Play subscriptions: " + billingResult.getDebugMessage());
          return;
        }
        JSArray list = new JSArray();
        for (Purchase purchase : purchases) list.put(serializePurchase(purchase));
        JSObject out = new JSObject();
        out.put("purchases", list);
        call.resolve(out);
      });
    });
  }

  @Override
  public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
    JSObject event = new JSObject();
    event.put("responseCode", billingResult.getResponseCode());
    event.put("debugMessage", billingResult.getDebugMessage());
    JSArray purchaseList = new JSArray();
    if (purchases != null) {
      for (Purchase purchase : purchases) purchaseList.put(serializePurchase(purchase));
    }
    event.put("purchases", purchaseList);
    notifyListeners("purchaseUpdated", event, true);

    PluginCall call = activePurchaseCall;
    if (call == null) return;
    activePurchaseCall = null;

    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
      JSObject out = new JSObject();
      out.put("state", "CANCELED");
      call.resolve(out);
      return;
    }
    if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
      JSObject out = new JSObject();
      out.put("state", "ERROR");
      out.put("responseCode", billingResult.getResponseCode());
      out.put("debugMessage", billingResult.getDebugMessage());
      call.resolve(out);
      return;
    }
    if (purchases == null || purchases.isEmpty()) {
      JSObject out = new JSObject();
      out.put("state", "ERROR");
      out.put("debugMessage", "Google Play returned OK without a purchase");
      call.resolve(out);
      return;
    }
    call.resolve(serializePurchase(purchases.get(0)));
  }

  private void queryProducts(List<String> productIds, PluginCall call) {
    List<QueryProductDetailsParams.Product> products = new ArrayList<>();
    for (String productId : productIds) {
      products.add(QueryProductDetailsParams.Product.newBuilder()
        .setProductId(productId)
        .setProductType(BillingClient.ProductType.SUBS)
        .build());
    }
    QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
      .setProductList(products)
      .build();

    billingClient.queryProductDetailsAsync(params, (billingResult, result) -> {
      if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
        call.reject("Unable to load Play products: " + billingResult.getDebugMessage());
        return;
      }
      JSArray list = new JSArray();
      for (ProductDetails details : result.getProductDetailsList()) list.put(serializeProduct(details));
      JSObject out = new JSObject();
      out.put("products", list);
      call.resolve(out);
    });
  }

  private void querySingleProductForPurchase(
    String productId,
    String basePlanId,
    String offerId,
    String accountId,
    String oldPurchaseToken,
    String oldProductId,
    String replacementMode,
    PluginCall call
  ) {
    QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
      .setProductList(Collections.singletonList(
        QueryProductDetailsParams.Product.newBuilder()
          .setProductId(productId)
          .setProductType(BillingClient.ProductType.SUBS)
          .build()
      ))
      .build();

    billingClient.queryProductDetailsAsync(params, (billingResult, result) -> {
      if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
        call.reject("Unable to resolve Play product: " + billingResult.getDebugMessage());
        return;
      }
      ProductDetails product = result.getProductDetailsList().stream()
        .filter(item -> productId.equals(item.getProductId()))
        .findFirst()
        .orElse(null);
      if (product == null) {
        call.reject("Requested Play subscription product is not available");
        return;
      }
      ProductDetails.SubscriptionOfferDetails selected = selectOffer(product, basePlanId, offerId);
      if (selected == null) {
        call.reject("Requested Play base plan/offer is not eligible or not available");
        return;
      }

      BillingFlowParams.ProductDetailsParams.Builder itemBuilder = BillingFlowParams.ProductDetailsParams.newBuilder()
        .setProductDetails(product)
        .setOfferToken(selected.getOfferToken());

      if (oldPurchaseToken != null && oldProductId != null) {
        BillingFlowParams.ProductDetailsParams.SubscriptionProductReplacementParams replacement =
          BillingFlowParams.ProductDetailsParams.SubscriptionProductReplacementParams.newBuilder()
            .setOldProductId(oldProductId)
            .setReplacementMode(parseReplacementMode(replacementMode))
            .build();
        itemBuilder.setSubscriptionProductReplacementParams(replacement);
      }

      BillingFlowParams.Builder flowBuilder = BillingFlowParams.newBuilder()
        .setProductDetailsParamsList(Collections.singletonList(itemBuilder.build()))
        .setObfuscatedAccountId(accountId);

      if (oldPurchaseToken != null) {
        flowBuilder.setSubscriptionUpdateParams(
          BillingFlowParams.SubscriptionUpdateParams.newBuilder()
            .setOldPurchaseToken(oldPurchaseToken)
            .build()
        );
      }

      Activity activity = getActivity();
      if (activity == null || activity.isFinishing()) {
        call.reject("Android activity is unavailable for Play checkout");
        return;
      }

      activePurchaseCall = call;
      BillingResult launchResult = billingClient.launchBillingFlow(activity, flowBuilder.build());
      if (launchResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
        activePurchaseCall = null;
        JSObject out = new JSObject();
        out.put("state", "ERROR");
        out.put("responseCode", launchResult.getResponseCode());
        out.put("debugMessage", launchResult.getDebugMessage());
        call.resolve(out);
      }
    });
  }

  private ProductDetails.SubscriptionOfferDetails selectOffer(ProductDetails product, String basePlanId, String offerId) {
    List<ProductDetails.SubscriptionOfferDetails> offers = product.getSubscriptionOfferDetails();
    if (offers == null) return null;
    for (ProductDetails.SubscriptionOfferDetails offer : offers) {
      if (!basePlanId.equals(offer.getBasePlanId())) continue;
      String candidateOffer = clean(offer.getOfferId());
      if (offerId == null ? candidateOffer == null : offerId.equals(candidateOffer)) return offer;
    }
    return null;
  }

  private JSObject serializeProduct(ProductDetails details) {
    JSObject product = new JSObject();
    product.put("productId", details.getProductId());
    product.put("name", details.getName());
    product.put("title", details.getTitle());
    product.put("description", details.getDescription());
    product.put("productType", details.getProductType());

    JSArray offers = new JSArray();
    List<ProductDetails.SubscriptionOfferDetails> source = details.getSubscriptionOfferDetails();
    if (source != null) {
      for (ProductDetails.SubscriptionOfferDetails offer : source) {
        JSObject item = new JSObject();
        item.put("basePlanId", offer.getBasePlanId());
        item.put("offerId", offer.getOfferId());
        item.put("offerToken", offer.getOfferToken());
        JSArray phases = new JSArray();
        for (ProductDetails.PricingPhase phase : offer.getPricingPhases().getPricingPhaseList()) {
          JSObject price = new JSObject();
          price.put("formattedPrice", phase.getFormattedPrice());
          price.put("priceAmountMicros", phase.getPriceAmountMicros());
          price.put("priceCurrencyCode", phase.getPriceCurrencyCode());
          price.put("billingPeriod", phase.getBillingPeriod());
          price.put("billingCycleCount", phase.getBillingCycleCount());
          price.put("recurrenceMode", phase.getRecurrenceMode());
          phases.put(price);
        }
        item.put("pricingPhases", phases);
        offers.put(item);
      }
    }
    product.put("offers", offers);
    return product;
  }

  private JSObject serializePurchase(Purchase purchase) {
    JSObject out = new JSObject();
    JSArray products = new JSArray();
    for (String productId : purchase.getProducts()) products.put(productId);
    out.put("productIds", products);
    if (!purchase.getProducts().isEmpty()) out.put("productId", purchase.getProducts().get(0));
    out.put("purchaseToken", purchase.getPurchaseToken());
    out.put("state", purchaseState(purchase.getPurchaseState()));
    out.put("purchaseTime", purchase.getPurchaseTime());
    out.put("acknowledged", purchase.isAcknowledged());
    out.put("autoRenewing", purchase.isAutoRenewing());
    return out;
  }

  private String purchaseState(int state) {
    if (state == Purchase.PurchaseState.PURCHASED) return "PURCHASED";
    if (state == Purchase.PurchaseState.PENDING) return "PENDING";
    return "UNSPECIFIED";
  }

  private int parseReplacementMode(String mode) {
    if (mode == null || mode.equalsIgnoreCase("DEFERRED")) {
      return BillingFlowParams.ProductDetailsParams.SubscriptionProductReplacementParams.ReplacementMode.DEFERRED;
    }
    if (mode.equalsIgnoreCase("CHARGE_FULL_PRICE")) {
      return BillingFlowParams.ProductDetailsParams.SubscriptionProductReplacementParams.ReplacementMode.CHARGE_FULL_PRICE;
    }
    if (mode.equalsIgnoreCase("CHARGE_PRORATED_PRICE")) {
      return BillingFlowParams.ProductDetailsParams.SubscriptionProductReplacementParams.ReplacementMode.CHARGE_PRORATED_PRICE;
    }
    if (mode.equalsIgnoreCase("KEEP_EXISTING")) {
      return BillingFlowParams.ProductDetailsParams.SubscriptionProductReplacementParams.ReplacementMode.KEEP_EXISTING;
    }
    return BillingFlowParams.ProductDetailsParams.SubscriptionProductReplacementParams.ReplacementMode.DEFERRED;
  }

  private void whenReady(PluginCall call, ReadyAction action) {
    if (billingClient == null) {
      call.reject("Google Play Billing is unavailable");
      return;
    }
    if (billingClient.isReady()) {
      action.run();
      return;
    }
    pendingActions.add(new PendingAction(call, action));
    connectIfNeeded();
  }

  private void connectIfNeeded() {
    if (billingClient == null || billingClient.isReady() || connecting) return;
    connecting = true;
    billingClient.startConnection(new BillingClientStateListener() {
      @Override
      public void onBillingSetupFinished(BillingResult billingResult) {
        connecting = false;
        if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
          rejectPending("Google Play Billing setup failed: " + billingResult.getDebugMessage());
          return;
        }
        List<PendingAction> actions = new ArrayList<>(pendingActions);
        pendingActions.clear();
        for (PendingAction pending : actions) pending.action.run();
      }

      @Override
      public void onBillingServiceDisconnected() {
        connecting = false;
        // Automatic reconnection is enabled. A future API call will reconnect.
      }
    });
  }

  private void rejectPending(String message) {
    List<PendingAction> actions = new ArrayList<>(pendingActions);
    pendingActions.clear();
    for (PendingAction pending : actions) pending.call.reject(message);
  }

  private List<String> readStringArray(JSArray array) {
    List<String> values = new ArrayList<>();
    if (array == null) return values;
    for (int index = 0; index < array.length(); index++) {
      try {
        String value = clean(array.getString(index));
        if (value != null && !values.contains(value)) values.add(value);
      } catch (JSONException ignored) {}
    }
    return values;
  }

  private String clean(String value) {
    if (value == null) return null;
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}
