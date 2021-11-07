### BLE Tester
###### A Cross-Platform App for testing BLE devices 
> Tested with Chrome and Android 6+

###### What is inside?
- [Ionic Framework](https://ionicframework.com/)
- [React JS](https://reactjs.org/)
- [Capacitor JS](https://capacitorjs.com)
- [Capacitor Community Bluetooth LE Plugin](https://github.com/capacitor-community/bluetooth-le)

#### Run & Build
##### Use
- [BLE Tester for Web (Needs Updated Desktop Chrome for Linx, Mac or Windows)](https://sourcya-ble-tester.web.app/)
- [Android APK](https://github.com/sourcya/ble-tester/blob/main/APK/app-debug.apk)

##### Development
- install node and npm
> requires root/administrator access
- install @ionic/cli
> requires root/administrator access
```
npm uninstall -g ionic
npm install -g @ionic/cli
```
- Run the project in development mode
```
ionic serve
```
##### Build for production
###### Web
```
ionic build --prod
```
On success the build directory will contain a production web build of the app

###### Android
> requires Linux machine & docker installed
```
sh build_android
```
On Success the APK directory will contain debug-app.apk

