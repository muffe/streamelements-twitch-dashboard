// ==UserScript==
// @name         StreamElements Dashboard Twitch Chat
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adjust the StreamElements dashboard to my needs
// @author       muffe
// @match        https://streamelements.com/dashboard
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';
    var channelName = "myChannel";
    var apiKey = "myAPIKey";

    var insert = `<twitch-settings channel="` + channelName + `" class="ng-isolate-scope">
                  <md-card class="_md"> \
                  <div class="md-primary md-no-sticky md-subheader _md" role="heading" aria-level="2">
                  <div id="live"></div>
                  <div id="chatters"></div>
                  <iframe frameborder="0"
                  scrolling="no"
                  id="chat_embed"
                  src="https://www.twitch.tv/` + channelName + `/chat"
                  height="500"
                  width="350">
                  </iframe>
                  </div>
                  <div class="layout-padding layout-column">
                  </md-card>
                  </twitch-settings>`;

    setTimeout(function() {
        $(insert).insertAfter('#bot-quicksettings');
        $('#bot-quicksettings').hide();
        $('md-toolbar').css("min-height", "30px");
        $('md-toolbar').css("height", "30px");
        $('.md-toolbar-tools').height(30);
        $('.beta-message').css("top", "5px");
        $('.container-fluid').css("padding-top", "0px");
        $('.front-graph').insertAfter($('.front-graph').next());
        getTwitchViewers();
        getChatPeople();
    }, 3000);

    window.setInterval(function(){
        getTwitchViewers();
        getChatPeople();
    }, 30000);


    function getTwitchViewers() {
        $.ajax({
            url:'https://api.twitch.tv/kraken/streams/' + channelName + '?client_id=' + apiKey,
            dataType:'json',
            success:function(stream) {
                checkStreamStatus(stream);
            },
            error:function() {
                streamIsOffline();
            }
        });
    }

    function getChatPeople() {
        $.ajax({
            url:'https://tmi.twitch.tv/group/user/' + channelName + '/chatters',
            dataType:'jsonp',
            type: 'GET',
            crossDomain: true,
            success:function(stream) {
                var chatters = stream.data.chatters.viewers;
                var mods = stream.data.chatters.moderators;
                var allUsers = chatters.concat(mods);
                allUsers = allUsers.filter(filterCertainUsers);

                document.getElementById("chatters").innerHTML="<div class=\"md-subheader-inner\"><div class=\"md-subheader-content\"><span class=\"ng-scope\">Chat: " + allUsers.join(", ") + "</span></div></div>";
            },
            error:function(xhr, status, error) {
                //NOP
            }
        });
    }

    function filterCertainUsers(userName) {
        var filterUsers = ["Array", "OfUsers", "ToFilter"];
        return filterUsers.indexOf(userName) == -1;
    }

    function streamIsOffline() {
        document.getElementById("live").innerHTML="<div class=\"md-subheader-inner\"><div class=\"md-subheader-content\"><span class=\"ng-scope\">CURRENTLY OFFLINE.</span></div></div>";
    }

    function checkStreamStatus(stream) {
        if(stream.stream !== null) {
            document.getElementById("live").innerHTML="<div class=\"md-subheader-inner\"><div class=\"md-subheader-content\"><span class=\"ng-scope\">CURRENTLY LIVE:<br/><br/> " .concat(parseInt(stream.stream.viewers), " VIEWERS <br/> ".concat(parseInt(stream.stream.channel.followers), " FOLLOWERS</span></div></div>"));
        } else {
            streamIsOffline();
        }
    }
})();
