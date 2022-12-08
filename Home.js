import {View, Text, Pressable, StyleSheet, ToastAndroid} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import AppLovinMAX from 'react-native-applovin-max';
import {useFocusEffect} from '@react-navigation/native';
import {DevSettings} from 'react-native';
import RNRestart from 'react-native-restart';

const adLoadState = {
  notLoaded: 'NOT_LOADED',
  loading: 'LOADING',
  loaded: 'LOADED',
};

const Home = ({navigation}) => {
  const [statusText, setStatusText] = useState('Initializing SDK...');
  const [loadText, setLoadText] = useState('');
  // const [priceEarned, setPriceEarned] = useState(0);
  const [lastRevenue, setLastRevenue] = useState(0);
  const [count, setCount] = useState(Math.floor(Math.random() * 2) + 5);
  const [total, setTotal] = useState(0);

  const [interstitialAdLoadState, setInterstitialAdLoadState] = useState(
    adLoadState.notLoaded,
  );
  const [interstitialRetryAttempt, setInterstitialRetryAttempt] = useState(0);
  const SDK_KEY =
    'duMo19yelqGHcy0fml497nb91q86eMMug8r1K4Qg35z13puDOSqgDS0-VLLsBSHWclcuhTLu20vaAl178W0xaF';

  const INTERSTITIAL_AD_UNIT_ID = Platform.select({
    android: '9e14a70e0e77b752',
  });

  const initAppLovinMax = () => {
    console.log('Initializer Responded');
    AppLovinMAX.initialize(SDK_KEY, () => {
      setStatusText('SDK Initialized...');
      AppLovinMAX.setTargetingDataKeywords([
        'category:insurance',
        'job:lawyer',
        'category:mortgage',
        'category:legal',
        'category:degree',
        'category:credit',
        'category:loans',
        'category:donate',
        'category:claim',
      ]);
      AppLovinMAX.setMuted(true);
      attachAdListeners();
      loadInterstitialAd();
    });
  };

  const loadInterstitialAd = () => {
    setStatusText('Loading interstitial ad...');
    const rand = Math.floor(Math.random() * 2) + 1;
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
        setTimeout(() => {
          loadInterstitialAd();
        }, retryDelay * 1000);
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
      setLoadText('Load New Ad');
    });
    AppLovinMAX.addEventListener('OnInterstitialAdRevenuePaid', adInfo => {
      setStatusText('Interstitial ad revenue paid: ' + adInfo.revenue);
    });
  };

  // Run after count is zero
  useEffect(() => {
    if (loadText === 'Load New Ad') {
      if (count === 0) {
        // navigation.reset({
        //   index: 0,
        //   routes: [{name: 'Reload'}],
        // });
        // DevSettings.reload();

        setStatusText('Reloading...');
        setTimeout(() => RNRestart.Restart(), 10000);
      } else {
        loadInterstitialAd();
      }
    } else {
      return;
    }
  }, [loadText, count]);

  // Initialize applovin by default
  useEffect(() => {
    console.log('Calling Initializer');
    initAppLovinMax();
  }, []);

  // Track and modify Count;
  useEffect(() => {
    if (statusText.includes('Interstitial ad hidden') && count !== 0) {
      console.log('Changing count...');
      setCount(count - 1);
    } else {
      return;
    }
  }, [statusText]);

  // Run when statusText has changed
  useEffect(() => {
    console.log(statusText);
  }, [statusText]);

  // listen to last revenue
  useEffect(() => {
    setTotal(total + lastRevenue);
  }, [lastRevenue]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.darker,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={styles.earned}>Time left before reset: {count}</Text>
      <Text style={styles.earned}>Total Earning: {total}</Text>
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
    fontSize: 22,
    marginVertical: 30,
    fontWeight: '900',
  },
});

export default Home;
