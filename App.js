import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useState } from 'react';

const AD_BLOCK_SCRIPT = `
(function() {
  window.open = function() { return null; };
  window.alert = function() {};
  window.confirm = function() { return false; };
  window.prompt = function() { return null; };

  function removeAds() {
    const selectors = [
      'iframe[src*="ads"]',
      'iframe[src*="pop"]',
      'iframe[src*="track"]',
      'div[class*="overlay"]',
      'div[class*="popup"]',
      'div[class*="modal"]:not([class*="video"]):not([class*="player"])',
      'div[id*="overlay"]',
      'div[id*="popup"]',
      'div[id*="ad-"]',
      'div[class*="ad-"]',
      '[class*="adsbygoogle"]',
      '[id*="adsbygoogle"]',
      'ins.adsbygoogle',
      'div[class*="banner-ad"]',
      'div[style*="position: fixed"][style*="z-index: 9"]',
      'div[style*="position:fixed"][style*="z-index:9"]',
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      const zIndex = parseInt(style.zIndex);
      const pos = style.position;
      if ((pos === 'fixed' || pos === 'sticky') && zIndex > 9000) {
        const tag = el.tagName.toLowerCase();
        if (!['nav', 'header'].includes(tag) && !el.querySelector('video')) {
          el.remove();
        }
      }
    });
  }

  removeAds();
  setInterval(removeAds, 1000);

  const origPushState = history.pushState.bind(history);
  const origReplaceState = history.replaceState.bind(history);

  function isBadUrl(url) {
    if (!url) return false;
    const bad = ['ads', 'click', 'track', 'redirect', 'pop', 'banner', 'doubleclick', 'googlesyndication'];
    return bad.some(k => url.toString().includes(k));
  }

  history.pushState = function(state, title, url) {
    if (isBadUrl(url)) return;
    return origPushState(state, title, url);
  };
  history.replaceState = function(state, title, url) {
    if (isBadUrl(url)) return;
    return origReplaceState(state, title, url);
  };

  true;
})();
`;

const BLOCKED_DOMAINS = [
  'doubleclick.net',
  'googlesyndication.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'ads.pubmatic.com',
  'prebid.org',
  'rubiconproject.com',
  'openx.net',
  'moatads.com',
  'amazon-adsystem.com',
  'scorecardresearch.com',
  'quantserve.com',
  'taboola.com',
  'outbrain.com',
  'popads.net',
  'popcash.net',
  'propellerads.com',
];

export default function App() {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const handleNavigationChange = (navState) => {
    const url = navState.url;
    const isBlocked = BLOCKED_DOMAINS.some(domain => url.includes(domain));
    if (isBlocked) {
      webViewRef.current?.stopLoading();
      webViewRef.current?.goBack();
    }
  };

  const handleShouldStartLoad = (request) => {
    const url = request.url;
    const isBlocked = BLOCKED_DOMAINS.some(domain => url.includes(domain));
    if (isBlocked) return false;
    if (url.startsWith('javascript:')) return false;
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#9b59b6" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://anikage.cc' }}
        style={styles.webview}
        injectedJavaScript={AD_BLOCK_SCRIPT}
        injectedJavaScriptBeforeContentLoaded={AD_BLOCK_SCRIPT}
        onNavigationStateChange={handleNavigationChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onLoadEnd={() => setLoading(false)}
        onLoadStart={() => setLoading(true)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        setSupportMultipleWindows={false}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    zIndex: 10,
  },
});
