import { Config } from "@remotion/cli/config";

Config.setPublicDir("./public");
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
Config.setAudioCodec("aac");
Config.setSampleRate(48000);

