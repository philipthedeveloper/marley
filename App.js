import {View, Text, Pressable, StyleSheet, ToastAndroid} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import AppLovinMAX from 'react-native-applovin-max';

const adLoadState = {
  notLoaded: 'NOT_LOADED',
  loading: 'LOADING',
  loaded: 'LOADED',
};

const App = () => {
  const [statusText, setStatusText] = useState('Initializing SDK...');
  // const [priceEarned, setPriceEarned] = useState(0);
  const [lastRevenue, setLastRevenue] = useState(0);

  const [interstitialAdLoadState, setInterstitialAdLoadState] = useState(
    adLoadState.notLoaded,
  );
  const [interstitialRetryAttempt, setInterstitialRetryAttempt] = useState(0);
  const SDK_KEY =
    'NTg065GfqZW46XMRSRuJ0tThKafkCpOTBSkwIercN6OoL6QTadEfNTKzZf8Tfy2fHq5MDLcKf-urWa0uOv0DzB';

  const INTERSTITIAL_AD_UNIT_ID = Platform.select({
    android: '1fa4844367bc1fa2',
  });

  const initAppLovinMax = () => {
    AppLovinMAX.initialize(SDK_KEY, () => {
      setStatusText('SDK Initialized...');
      AppLovinMAX.targetingData.interests = [
        'tiktok',
        'instagram',
        'insurance',
        'lawyer',
        'mortgage',
        'legal',
        'degree',
        'credit',
        'loans',
        'donate',
        'claim',
      ];
      AppLovinMAX.targetingData.keywords = [
        'tiktok',
        'instagram',
        'insurance',
        'job:lawyer',
        'mortgage',
        'legal',
        'degree',
        'credit',
        'loans',
        'donate',
        'claim',
      ];
      AppLovinMAX.setTargetingDataInterests([
        'tiktok',
        'instagram',
        'insurance',
        'lawyer',
        'mortgage',
        'legal',
        'degree',
        'credit',
        'loans',
        'donate',
        'claim',
      ]);
      AppLovinMAX.setMuted(true);
      attachAdListeners();
      loadInterstitialAd();
    });
  };

  const loadInterstitialAd = val => {
    setStatusText('Loading interstitial ad...');
    const rand = Math.floor(Math.random() * 2) + 1;
    console.log(rand);
    setTimeout(() => {
      AppLovinMAX.loadInterstitial(INTERSTITIAL_AD_UNIT_ID);
    }, rand * 1000);
  };

  const showInterstitialAdAuto = () => {
    setTimeout(() => {
      if (AppLovinMAX.isInterstitialReady(INTERSTITIAL_AD_UNIT_ID)) {
        AppLovinMAX.showInterstitial(INTERSTITIAL_AD_UNIT_ID);
      } else {
        setStatusText('Loading interstitial ad...');
        setInterstitialAdLoadState(adLoadState.loading);
      }
    }, 1500);
  };

  const attachAdListeners = () => {
    // Interstitial Listeners
    AppLovinMAX.addEventListener('OnInterstitialLoadedEvent', adInfo => {
      setInterstitialAdLoadState(adLoadState.loaded);

      // Interstitial ad is ready to be shown. AppLovinMAX.isInterstitialReady(INTERSTITIAL_AD_UNIT_ID) will now return 'true'
      setStatusText('Interstitial ad loaded from ' + adInfo.networkName);

      showInterstitialAdAuto();

      // Reset retry attempt
      setInterstitialRetryAttempt(0);
    });
    AppLovinMAX.addEventListener('OnInterstitialLoadFailedEvent', errorInfo => {
      // Interstitial ad failed to load
      // We recommend retrying with exponentially higher delays up to a maximum delay (in this case 64 seconds)
      setInterstitialRetryAttempt(interstitialRetryAttempt + 1);

      let retryDelay = Math.pow(2, Math.min(6, interstitialRetryAttempt));
      setStatusText(
        'Interstitial ad failed to load with code ' +
          errorInfo.code +
          ' - retrying in ' +
          retryDelay +
          's',
      );

      setTimeout(() => {
        loadInterstitialAd();
      }, retryDelay * 1000);
    });
    AppLovinMAX.addEventListener('OnInterstitialClickedEvent', adInfo => {
      setStatusText('Interstitial ad clicked');
    });
    AppLovinMAX.addEventListener('OnInterstitialDisplayedEvent', adInfo => {
      setStatusText('Interstitial ad displayed');
    });
    AppLovinMAX.addEventListener(
      'OnInterstitialAdFailedToDisplayEvent',
      adInfo => {
        setInterstitialAdLoadState(adLoadState.notLoaded);
        setStatusText('Interstitial ad failed to display');
      },
    );
    AppLovinMAX.addEventListener('OnInterstitialHiddenEvent', adInfo => {
      setInterstitialAdLoadState(adLoadState.notLoaded);
      setStatusText('Interstitial ad hidden');
      setLastRevenue(adInfo.revenue);
      ToastAndroid.showWithGravity(
        `${adInfo.revenue}`,
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );

      loadInterstitialAd(adInfo.revenue);
    });
    AppLovinMAX.addEventListener('OnInterstitialAdRevenuePaid', adInfo => {
      setStatusText('Interstitial ad revenue paid: ' + adInfo.revenue);
    });
  };

  // Run once after mounting
  useEffect(() => {
    initAppLovinMax();
  }, []);

  // Run when statusText has changed
  useEffect(() => {
    console.log(statusText);
  }, [statusText]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.darker,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={styles.earned}>Status Text: {statusText}</Text>
      <Text style={{color: '#fff'}}>Auto Impression App</Text>
      <Text style={styles.earned}>Last Revenue: {lastRevenue}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'orange',
    marginTop: 24,
    borderRadius: 6,
  },

  earned: {
    fontSize: 30,
    marginVertical: 30,
    fontWeight: '900',
  },
});

export default App;
