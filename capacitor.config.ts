import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "org.ontherecord.app",
  appName: "On the record",
  webDir: "dist",
  // No server.url / server.cleartext: the app is bundled entirely, no
  // remote origin is ever loaded, and no cleartext or otherwise traffic
  // is permitted.
  android: {
    allowMixedContent: false
  },
  ios: {
    contentInset: "automatic"
  }
};

export default config;
