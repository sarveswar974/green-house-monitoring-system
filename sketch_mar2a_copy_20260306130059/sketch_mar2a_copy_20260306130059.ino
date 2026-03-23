#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11
#define LDRPIN 35_

DHT dht(DHTPIN, DHTTYPE);

// WiFi
const char* ssid = "Sarveswar";
const char* password = "12345678";

// MQTT
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {

Serial.begin(115200);
dht.begin();

WiFi.begin(ssid, password);

while (WiFi.status() != WL_CONNECTED) {
delay(500);
Serial.println("Connecting WiFi...");
}

Serial.println("WiFi Connected");

client.setServer(mqttServer, mqttPort);

while (!client.connected()) {
Serial.println("Connecting to MQTT...");
client.connect("ESP32Greenhouse");
}

Serial.println("MQTT Connected");

}

void loop() {

float temperature = dht.readTemperature();
float humidity = dht.readHumidity();
int light = analogRead(LDRPIN);

char tempString[8];
dtostrf(temperature, 1, 2, tempString);

char humString[8];
dtostrf(humidity, 1, 2, humString);

char lightString[8];
dtostrf(light, 1, 2, lightString);

client.publish("greenhouse/temperature", tempString);
client.publish("greenhouse/humidity", humString);
client.publish("greenhouse/light", lightString);

Serial.println(tempString);
Serial.println(humString);
Serial.println(lightString);

delay(3000);
}