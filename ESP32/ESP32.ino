#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define WIFI_SSID "12345678"
#define WIFI_PASSWORD "12345678"
#define API_KEY "AIzaSyDHsT85-qxs8PEIHPsOjmFYjlGtnsCwoqw"
#define DATABASE_URL "https://esp32proyectolrn-default-rtdb.firebaseio.com/"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = "";
  auth.user.password = "";

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  float humedad = 50.0;
  float temperatura = 22.5;

  if (Firebase.RTDB.setFloat(&fbdo, "/sensor/humedadambiente", humedad)) {
    Serial.println("✔ Humedad subida");
  } else {
    Serial.println("✖ Error humedad: " + fbdo.errorReason());
  }

  if (Firebase.RTDB.setFloat(&fbdo, "/sensor/temperaturaambiente", temperatura)) {
    Serial.println("✔ Temperatura subida");
  } else {
    Serial.println("✖ Error temperatura: " + fbdo.errorReason());
  }

  delay(10000);
}
