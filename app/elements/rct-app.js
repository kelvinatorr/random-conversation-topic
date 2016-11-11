/**
 * Created by Kelvin on 11/11/2016.
 */
(function() {
    var urlShortenerReady;
    Polymer({
        is: "rct-app",
        properties: {
            topics: {
                type: Array,
                observer: 'topicsChanged'
            },
            visibleTopic: {
                type: String
            },
            currentIndex: {
                type: Number,
                observer: 'currentIndexChanged'
            },
            pickIndex: {
                type: Number
            },
            _shared: {
                type: Boolean,
                value: false
            }
        },

        ready: function() {
            console.log('App is ready!');

            var shortener = document.getElementById('shortener');

            var self = this;

            shortener.addEventListener('google-api-load', function() {
                gapi.client.setApiKey('AIzaSyClduzlz0MPdn4e6jVnMX6M2iAwa8e96MA');
            });

            urlShortenerReady =  new Promise(function(resolve) {
                shortener.addEventListener('google-url-shortener-ready', resolve);
            });

            // check if the location hash has a valid share key
            if(location.hash) {
                this._checkHash();
            }
            window.addEventListener('hashchange', function() {
                self._checkHash();
            });

        },

//            _readyForAction: function() {
//                console.log('ready for action');
//                console.log(this.$.urlshortener.api.url);
//                var request = this.$.urlshortener.api.url.insert(
//                        {resource: {longUrl: 'http://www.vanityfair.com/news/2016/09/barack-obama-doris-kearns-goodwin-interview'}, key: 'AIzaSyClduzlz0MPdn4e6jVnMX6M2iAwa8e96MA'});
////                request.key =
//                request.execute(function(response) {
//                    if (response && response.id) {
////                        this.shortUrl = response.id;
//                        console.log('Success ', response.id);
//
////                        this.fire('google-url-shorten', {shortUrl: response.id});
//                    } else {
//                        var error = response && response.error ? response.error.message : 'Unknown error';
//                        console.log(error)
//                    }
//                }.bind(this));
//            },


        pickATopic: function() {
            // disable the pick button
            var pickTopicBtn = document.getElementById('pickATopicBtn');
            pickTopicBtn.disabled = true;
            // select a random number from the length of the topics array
            this.pickIndex = Math.floor(Math.random() * this.topics.length);
            var rctTopic = document.getElementById('rctTopic');
            rctTopic.hidden = false;
            rctTopic.classList.remove('done');
            // run slot machine-ish look
            var self = this;
            Promise.all(this._runSlotMachineLook()).then(function() {
                // show the pick
                self.currentIndex = self.pickIndex;
                pickTopicBtn.disabled = false;
                rctTopic.classList.add('done');
            });
        },

        share: function() {
            var self = this;
            console.log('generating share token');
            var firebaseShares = document.getElementById('firebaseShares');
            firebaseShares.disabled = false;
            var newSharesKey = firebaseShares.ref.push().key;
            console.log(newSharesKey);
            firebaseShares.ref.child(newSharesKey).set(this.currentIndex).then(function() {
                firebaseShares.path = '/shares/' + newSharesKey;
                firebaseShares.data = self.currentIndex;
            });
            urlShortenerReady.then(function() {
                var shortener = document.getElementById('shortener');
                shortener.addEventListener('google-url-shorten', function() {
                    // show the shortened url
                    var shareUrl = document.getElementById('shareUrl');
                    shareUrl.innerHTML = shortener.shortUrl;
                    shareUrl.hidden = false;
                    var shareMessage = document.getElementById('shareMessage');
                    shareMessage.hidden = false;
                });
                shortener.addEventListener('google-url-shorten-error', function() {
                    // show error message
                    var shareMessage = document.getElementById('shareMessage');
                    shareMessage.innerHTML = shortener.error;
                    shareMessage.hidden = false;
                });
                shortener.longUrl =  '//' + window.location.host + '/#' + newSharesKey;
                shortener.shorten();
            });
            document.getElementById('shareBtn').disabled = true;
            this._shared = true;
        },

        currentIndexChanged: function() {
            if(Number.isInteger(this.currentIndex) && this.topics.length > 0) {
                this.visibleTopic = this.topics[this.currentIndex];
            }
        },

        topicsChanged: function() {
            if(this.topics.length > 0) {
                // topics ready
                document.getElementById('pickATopicBtn').disabled = false;
                document.getElementById('shareBtn').disabled = this._shared;
                if(!Number.isInteger(this.currentIndex)) {
                    this.currentIndex = Math.floor(Math.random() * this.topics.length);
                }
                this.visibleTopic = this.topics[this.currentIndex];
                // show the topic
                var rctTopic = document.getElementById('rctTopic');
                rctTopic.hidden = false;
                rctTopic.classList.add('done');
            } else {
                document.getElementById('pickATopicBtn').disabled = true;
                document.getElementById('shareBtn').disabled = true;
            }
        },

        _runSlotMachineLook: function() {
            var self = this;
            // randomly select a start index
            this.currentIndex = Math.floor(Math.random() * this.topics.length);
            var totalWait = 5000;
            var wait = 0;
            var counter = 0;
            var allTimeouts = [];
            while (totalWait > wait) {
                wait += 50 + (counter * 50);
                var promise = this._setTimeoutPromise(function() {
                    // make it more "random"
                    var newIndex = Math.floor(Math.random() * self.topics.length);
                    if(newIndex !==  self.currentIndex) {
                        self.currentIndex = newIndex;
                    } else {
                        self.currentIndex = Math.floor(Math.random() * self.topics.length);
                    }
                }, wait);
                allTimeouts.push(promise);
                counter += 1;
            }
            return allTimeouts;
        },

        _setTimeoutPromise: function(func, delay) {
            return new Promise(function(resolve) {
                window.setTimeout(function() {
                    func();
                    resolve();
                }, delay);
            });
        },

        _checkHash: function() {
            var self = this;
            firebase.database().ref('shares/' + location.hash.substring(1)).once('value').then(function(data) {
                var index = data.val();
                if(index && Number.isInteger(index) && index > 0) {
                    self.currentIndex = index;
                    var firebaseShares = document.getElementById('firebaseShares');
                    firebaseShares.disabled = false;
                    firebaseShares.path = '/shares/' + location.hash.substring(1);
                    document.getElementById('shareBtn').disabled = true;
                    self._shared = true;
                } else {
                    document.getElementById('shareBtn').disabled = false;
                    self._shared = false;
                }
            });
        }

    });
})();