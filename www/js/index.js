/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },


    onDeviceReady: function () {

        const errmess = document.getElementById('errmess');
        const casella = document.getElementById('casella');
        const casella0 = document.getElementById('casella0');
        const kodiVersionInput = document.getElementById('kodiVersion');
        document.getElementById("su").addEventListener('click', play);

        document.addEventListener('input', function (event) {
            let indip = casella0.value.toString();
            NativeStorage.setItem("ip", indip, function () {}, );
        }, false);

        document.addEventListener('keypress', function (event) {
            event.preventDefault();
            let keycode = event.keyCode || event.which;
            if (keycode == '13') {
                if (document.activeElement == casella) {
                    play();
                } else {
                    casella.focus();
                    casella.scrollIntoView();
                }
            }
        }, false);


        NativeStorage.getItem("ip", function (result) {
            casella0.value = result
        }, function () {});

        NativeStorage.getItem("kodiVersion", function (result) {
            kodiVersionInput.value = result
        }, function () {});


        window.plugins.intentShim.onIntent(function (intent) {
            let link = intent.extras["android.intent.extra.TEXT"];
            if (link == null || link == undefined) {
                casella.value = "";
            } else {
                casella.value = link;
                NativeStorage.getItem("ip", function (ip) {
                    NativeStorage.getItem("kodiVersion", function(kodiVersion){
                        sendstream(link, ip, kodiVersion);
                    })
                }, function () {});
            }

        });

        window.plugins.intentShim.getIntent(function (intent) {
            let link = intent.extras["android.intent.extra.TEXT"];
            if (link == null || link == undefined) {
                casella.value = "";
            } else {
                casella.value = link;
                NativeStorage.getItem("ip", function (ip) {
                    NativeStorage.getItem("kodiVersion", function(kodiVersion){
                        sendstream(link, ip, kodiVersion);
                    })
                }, function () {});
            }
        }, function () { /*this is the error callback*/ });

        function play() {
            let kodiVersion = kodiVersionInput.value.toString();
            let indip = casella0.value.toString();
            let link = casella.value;
            if (indip == "") {
                casella0.placeholder = "Put your IP first!"
            } else {
                NativeStorage.setItem("kodiVersion", kodiVersion);
                NativeStorage.setItem("ip", indip, sendstream(link, indip, kodiVersion), );
            }
        }

        function sendstream(link, indip, kodiVersion) {
            let pluginId;
            if (kodiVersion == "v19") {
                pluginId = "plugin.video.sendtokodi.python3";
            } else {
                pluginId = "plugin.video.sendtokodi";
            }
            let data = '{"jsonrpc": "2.0", "method": "Player.Open", "params": {"item":{ "file": "plugin://' + pluginId + '/?' + link + '"}}, "id": 1}';
            let json = JSON.stringify(eval("(" + data + ")"));
            let websocket = new WebSocket('ws://' + indip + ':9090/jsonrpc?awxi');
            websocket.onerror = function () {
                errmess.setAttribute('style', 'visibility:visible');
            };
            websocket.onopen = function (evt) {
                websocket.send(json);
                errmess.setAttribute('style', 'visibility:hidden');
            };
        }

        // function checkKodiVersion(){

        //     let data = '{"jsonrpc": "2.0", "method": "Addons.GetAddons", "id": 1}';
        //     let json = JSON.stringify(eval("(" + data + ")"));
        //     let websocket = new WebSocket('ws://' + indip + ':9090/jsonrpc?awxi');
        //     websocket.onerror = function () {
        //         errmess.setAttribute('style', 'visibility:visible');
        //     };
        //     websocket.onopen = function (evt) {
        //         websocket.send(json);
        //         errmess.setAttribute('style', 'visibility:hidden');
        //     };


        //     let addonsIds = response.result.addons.map((value)=> value.addonid)
        //     console.log(addonsIds);
        //     if (addonsIds.includes("plugin.video.sendtokodi")){
        //         console.log("Kodi18");
        //     } else if (addonsIds.includes("plugin.video.sendtokodi.python3")) {
        //         console.log("Kodi19");
        //     } else {
        //         console.log("Error");
        //     }
        // }
    },
};

app.initialize();
