import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Dimensions, Animated, TouchableOpacity, Image, Easing, TextInput, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Modal from "react-native-modal";
import { CustomChat } from './index'
import MyInputToolbar from './MyInputToolbar'
import "moment";
import "moment/locale/ja";
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
import Video from 'react-native-video'
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder'
import LottieView from "lottie-react-native";
import { ifIphoneX, isIphoneX, getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

const {height, width} = Dimensions.get('window');

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputBoxExpanded: false,
      modalHeight: new Animated.Value(100),
      inputHeight: new Animated.Value(60),
      inputTransformY: new Animated.Value(0),
      headerColor: new Animated.Value(0),
      modalShadowOpacity: new Animated.Value(0.0),
      messageInputOpacity: new Animated.Value(0),
      placeholderOpacity: new Animated.Value(1),
      messageModalVisible: false,
      placeholderVisible: true,
      messages: [],
    };
  }

  componentDidMount() {
  }

  getRequestForPresignedUrl() {
    return global.apiReqest('GET', '/api/v1/users/my/products/request_for_presigned_url').then((responseJson) => {
      console.error(responseJson);
    }).catch((error) => {
      console.error(error);
    });
  }

  async sendPackagePhoto() {
    this.getRequestForPresignedUrl().then((data) => {
      const { url, url_fields } = data;
      const uri = '';
      const type = '';
      const name = `${new Date().getTime()}.${fileType}`;
      const file = {uri, name, type};

      const formData = new FormData();
      formData.append('key', url_fields['key']);
      formData.append('policy', url_fields['policy']);
      formData.append('success_action_status', url_fields['success_action_status']);
      formData.append('x-amz-algorithm', url_fields['x-amz-algorithm']);
      formData.append('x-amz-credential', url_fields['x-amz-credential']);
      formData.append('x-amz-date', url_fields['x-amz-date']);
      formData.append('x-amz-signature', url_fields['x-amz-signature']);
      formData.append('file', file);

      return global.apiReqest('POST', url, {'Content-Type': 'multipart/form-data'}, formData).then((responseJson) => {
        console.error(responseJson);
      }).catch((error) => {
        console.error(error);
      });
    })
  }

  onFocusInput() {
    this.openChatModal();
  }

  onBlurInput() {
    this.closeChatModal();
  }

  openChatModal() {
    // this.props.onModalOpen();
    this.initializeChat();

    setTimeout(() => {
      this.setState({messageModalVisible: true});
    }, 50);

    Animated.timing(
      this.state.headerColor,
      {
        delay: 100,
        toValue: 90,
        duration: 400,
      }
    ).start();

    Animated.timing(
      this.state.modalShadowOpacity,
      {
        delay: 300,
        toValue: 0.6,
        duration: 400,
      }
    ).start();

    Animated.timing(
      this.state.messageInputOpacity,
      {
        delay: 300,
        toValue: 1,
        duration: 400,
      }
    ).start();

    Animated.timing(
      this.state.placeholderOpacity,
      {
        delay: 200,
        toValue: 0,
        duration: 400,
      }
    ).start();

    // Animation for input.
    Animated.spring(
      this.state.inputTransformY,
      {
        toValue: 4,
        duration: 8,
        useNativeDriver: true
      }
    ).start(() => {
      Animated.timing(
        this.state.inputTransformY,
        {
          toValue: 0,
          duration: 50,
          useNativeDriver: true
        }
      ).start();
    });
  }

  closeChatModal() {
    this.setState({messageModalVisible: false, messages: []});
    setTimeout(() => {
      this.setState({placeholderVisible: true});
    }, 300);

    Animated.timing(
      this.state.headerColor,
      {
        toValue: 0,
        duration: 200,
      }
    ).start();

    Animated.timing(
      this.state.modalShadowOpacity,
      {
        toValue: 0.0,
        duration: 200,
      }
    ).start();

    Animated.timing(
      this.state.messageInputOpacity,
      {
        toValue: 0,
        duration: 200,
      }
    ).start();

    Animated.timing(
      this.state.placeholderOpacity,
      {
        toValue: 1,
        duration: 200,
      }
    ).start();
  }

  renderInputToolbar (props) {
    return <MyInputToolbar {...props} onAttachmentIconPress={() => this._onAttachmentIconPress()} containerStyle={{padding: 0}} />;
  }

  renderMessageVideo(props) {
    return(
      <TouchableOpacity onPress={() => alert(props.currentMessage.video)}>
        <Image style={{width: 160, height: 90, borderRadius: 12, margin: 3}} source={{uri: props.currentMessage.videoCover}} />
      </TouchableOpacity>
    );
  }

  renderFooter() {
    if (this.state.messages.length > 0) {
      if (this.state.typingUser) {
        return (
          <View style={{flexDirection: 'row', padding: 10}}>
            <Image style={{width: 36, height: 36, borderRadius: 18}} source={{uri: this.state.typingUser.avatar}} />
            <View style={{height: 40, width: 80, overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}>
              <LottieView
                ref={animation => {
                  this.animation = animation;
                }}
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: 'transparent',
                }}
                autoPlay
                source={require('../assets/animations/typing1.json')}
              />
            </View>
          </View>
        )
      }
      return null;
    }

    return (
      <View>
        <View style={{flexDirection: 'row', padding: 4, alignItems: 'flex-end', justifyContent: 'center'}}>
          <ShimmerPlaceHolder colorShimmer={['#ebebeb', '#dddddd', '#ebebeb']} duration={1800} width={200} widthShimmer={1} style={{backgroundColor: '#eee', marginLeft: 8, borderRadius: 10, width: 150, height: 20}} autoRun={true} />
        </View>
        <View style={{flexDirection: 'row', padding: 10, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
          <ShimmerPlaceHolder colorShimmer={['#ebebeb', '#dddddd', '#ebebeb']} duration={1800} width={200} widthShimmer={1} style={{backgroundColor: '#eee', marginLeft: 8, borderRadius: 10, width: 150, height: 50}} autoRun={true} />
        </View>
        <View style={{flexDirection: 'row', padding: 10, alignItems: 'flex-end'}}>
          <ShimmerPlaceHolder colorShimmer={['#ebebeb', '#dddddd', '#ebebeb']} duration={1800} widthShimmer={1} style={{backgroundColor: '#eee', width: 36, height: 36, borderRadius: 20}} autoRun={true} />
          <View>
            <ShimmerPlaceHolder colorShimmer={['#ebebeb', '#dddddd', '#ebebeb']} duration={1800} width={250} widthShimmer={1} style={{backgroundColor: '#eee', marginLeft: 8, borderRadius: 10, width: 250, height: 40, marginBottom: 4}} autoRun={true} />
            <ShimmerPlaceHolder colorShimmer={['#ebebeb', '#dddddd', '#ebebeb']} duration={1800} width={250} widthShimmer={1} style={{backgroundColor: '#eee', marginLeft: 8, borderRadius: 10, width: 250, height: 120}} autoRun={true} />
          </View>
        </View>
        <View style={{flexDirection: 'row', padding: 10, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
          <ShimmerPlaceHolder colorShimmer={['#ebebeb', '#dddddd', '#ebebeb']} duration={1800} width={200} widthShimmer={1} style={{backgroundColor: '#eee', marginLeft: 8, borderRadius: 10, width: 150, height: 80}} autoRun={true} />
        </View>
        <View style={{flexDirection: 'row', padding: 10, alignItems: 'flex-end'}}>
          <ShimmerPlaceHolder colorShimmer={['#ebebeb', '#dddddd', '#ebebeb']} duration={1800} widthShimmer={1} style={{backgroundColor: '#eee', width: 36, height: 36, borderRadius: 20}} autoRun={true} />
          <ShimmerPlaceHolder colorShimmer={['#ebebeb', '#dddddd', '#ebebeb']} duration={1800} width={250} widthShimmer={1} style={{backgroundColor: '#eee', marginLeft: 8, borderRadius: 10, width: 250, height: 120}} autoRun={true} />
        </View>
        <View style={{flexDirection: 'row', padding: 10, alignItems: 'flex-end', justifyContent: 'flex-end'}}>
          <ShimmerPlaceHolder colorShimmer={['#ebebeb', '#dddddd', '#ebebeb']} duration={1800} width={200} widthShimmer={1} style={{backgroundColor: '#eee', marginLeft: 8, borderRadius: 10, width: 150, height: 50}} autoRun={true} />
        </View>
      </View>
    )
  }

  onSend(messages = []) {
    let data = {
      message: {
        text: messages[0].text
      }
    }
    global.apiReqest('POST', '/api/v1/my/products/' + this.props.productId + '/messages', null, JSON.stringify(data)).then((responseJson) => {
      // console.error(responseJson);
    }).catch((error) => {
      // console.error(error);
    });
  }

  uploadImage() {
    let data = {
      message: {
        text: 'ファイルをアップロードしました。',
        message_attachment_attributes: {
          thumbnail: 'https://pbs.twimg.com/profile_images/977229272589877248/tvazqbxS_400x400.jpg',
          file_type: 'png',
          src: 'https://pbs.twimg.com/profile_images/977229272589877248/tvazqbxS_400x400.jpg'
        }
      }
    }
    global.apiReqest('POST', '/api/v1/my/products/' + this.props.productId + '/messages', null, JSON.stringify(data)).then((responseJson) => {
      // console.error(responseJson);
    }).catch((error) => {
      // console.error(error);
    });
  }

  handleMessage(new_message) {
    // {"text":"A","user":{"_id":1},"createdAt":"2020-03-25T04:10:30.064Z","_id":"7b3d20eb-1db6-47b5-bf03-0e8cbc0db9dc"}
    let messages = [];
    messages.push(new_message);

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  _onAttachmentIconPress() {
    // this.getPermissionAsync().then(() => {
    //   this._pickImage();
    // })
    this.uploadImage();
  }

  async getPermissionAsync() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }
  }

  async _pickImage() {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true
    }).then(image => {
      console.log(image);
    });

    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }
  };

  // API Reqs
  async checkMessageMember() {
    return global.apiReqest('POST', '/api/v1/my/products/' + this.props.productId + '/chat_members').then((responseJson) => {
      // {"product_id":19532,"member_id":9566,"member_name":"","member_type":"User","member_avatar":"","last_read_at":null,"unread_count":0}
      if (responseJson.errors[0].status == 422 || responseJson.product_id) {
        return this.props.productId;
      } else {
        throw new Error(JSON.stringify(responseJson));
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  initializeChat() {
    this.checkMessageMember().then(() => {
      this.getMessages();
      this.setState({placeholderVisible: false});
    }).catch((e) => {
      setTimeout(() => {
        Alert.alert('エラー', 'チャットの初期化中にエラーが発生しました')
      }, 500);
      console.error(e);
    });
  }

  getMessages() {
    this.setState({messages: []});
    let messages_request_per = 20;
    let messages_request_page = 1;

    this.setState({});

    global.apiReqest('GET', '/api/v1/my/products/' + this.props.productId + '/messages').then((responseJson) => {
      this.parseApiResponseMessages(responseJson.messages);
    }).catch((error) => {
      console.error(error);
    });
  }

  parseApiResponseMessages(messages) {
    let new_messages = [];
    // {"id":"01d8c0ea-ac98-4484-bc83-33bcde8743f8","text":"A","sender_id":9566,"sender_name":"","sender_type":"User","sender_avatar":"","created_at":"2020-03-25T13:47:52.649+09:00","ts":1585111672,"message_attachment":null}

    if (messages) {
      messages.map((message) => {
        _message = message;
        _message.user = {
          _id: message.sender_id
        },
        _message.createdAt = message.created_at;
        _message._id = message.id;

        if (message.message_attachment && message.message_attachment.thumbnail) {
          console.warn(message.message_attachment.thumbnail);
          _message.image = message.message_attachment.thumbnail;
        }

        new_messages.push(_message);
      });

      this.setState({messages: new_messages});
    }
  }

  render() {
    let {icon, name, desc} = this.props.room;
    var color = this.state.headerColor.interpolate({
      inputRange: [0, 100],
      outputRange: ['rgba(255, 255, 255, 1.0)', 'rgba(26, 35, 255, 1.0)']
    });

    return (
      <SafeAreaView style={styles.container}>
        <Modal animationInTiming={500} animationOutTiming={500} swipeThreshold={100} onSwipeComplete={(dir) => {this.closeChatModal()}} onBackdropPress={() => this.closeChatModal()} coverScreen={false} backdropOpacity={0} isVisible={this.state.messageModalVisible} style={{padding: 0, margin: 0,shadowOffset: { width: 0, height: 3, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 20}}>
          <Animated.View style={{backgroundColor: color, borderRadius: 10, overflow: 'hidden', height: height-80, marginTop: 80, shadowColor: "#000", }}>
            <LinearGradient
               colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0)']}
               start={[0.6, 0]}
               end={[0, 0]}
               style={{
                 position: 'absolute',
                 right: -40,
                 top: 0,
                 height: 50,
                 width: 200
               }}
             />
             <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                end={[0.6, 0]}
                start={[0, 0]}
                style={{
                  position: 'absolute',
                  left: -40,
                  top: 0,
                  height: 50,
                  width: 280
                }}
            />
            <TouchableOpacity style={{position: 'absolute', top: 0, left: 4, width: 32, height: 50, alignItems: 'center', justifyContent: 'center'}} onPress={() => this.closeChatModal()}>
              <Ionicons style={{fontSize: 24, color: '#fff', opacity: 0.8}} name={'ios-arrow-back'} />
            </TouchableOpacity>
            <TouchableOpacity style={{position: 'absolute', top: -1, right: 40, width: 40, height: 50, alignItems: 'center', justifyContent: 'center'}}>
              <MaterialIcons style={{fontSize: 20, color: '#fff', opacity: 0.8}} name={'settings'} />
            </TouchableOpacity>
            <TouchableOpacity style={{position: 'absolute', top: 0, right: 8, width: 32, height: 50, alignItems: 'center', justifyContent: 'center'}} onPress={() => this.closeChatModal()}>
              <Ionicons style={{fontSize: 24, color: '#fff', opacity: 0.8}} name={'md-close'} />
            </TouchableOpacity>

            <TouchableOpacity style={{position: 'absolute', top: 0, left:90, width: 32, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Image style={{width: 34, height: 34, borderRadius: 17, marginLeft: 16}} source={{uri: icon}} />
              <View style={{borderColor: 'white', borderWidth: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#00BB34', position: 'absolute', top: 11, left: 60}} />
              <View style={{width: 100, marginLeft: 12}}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: '#FFF'}}>{name}</Text>
                <Text style={{fontSize: 11, color: '#ddd', marginTop: 3}}>{desc}</Text>
              </View>
            </TouchableOpacity>

            <View style={{flex:1, marginTop: 50, backgroundColor: '#fff', ...ifIphoneX({paddingBottom: getBottomSpace()})}}>
              <CustomChat
                typingDisabled={this.state.typingDisabled}
                textInputProps={{autoFocus: true}}
                locale={'ja'}
                renderMessageVideo={this.renderMessageVideo.bind(this)}
                renderInputToolbar={this.renderInputToolbar.bind(this)}
                placeholder={'メッセージを入力'}
                messages={this.state.messages}
                renderFooter={this.renderFooter.bind(this)}
                onSend={messages => this.onSend(messages)}
                user={{
                  _id: this.props.currentUserId,
                }}
              />
            </View>
          </Animated.View>
        </Modal>
        {this.state.placeholderVisible ?
        <Animated.View style={{backgroundColor: '#fff', borderRadius: 10, height: 60, transform: [{translateY: this.state.inputTransformY}], borderWidth: 0.5, borderColor: '#e5e5e5', position: 'absolute', top: 'auto', bottom: 0, left: 0, width: '100%', shadowColor: "#000", shadowOffset: { width: 0, height: 6, }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 20}}>
          <TouchableOpacity activeOpacity={0.6} onPress={() => this.openChatModal()} style={{overflow: 'hidden', height: '100%', paddingBottom: 16, paddingLeft: 20, paddingRight: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
            <Animated.View style={{opacity: this.state.placeholderOpacity}}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                <MaterialIcons style={{fontSize: 16, color: '#777', marginRight: 8}} name={'chat'} />
                <Text style={{fontSize: 15, color: '#777'}}>メッセージを入力...</Text>
              </View>
            </Animated.View>

            <Image style={{width: 32, height: 32, borderRadius: 16,}} source={{uri: icon}} />
            <View style={{borderColor: 'white', borderWidth: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#00BB34', position: 'absolute', top: 12, right: 16}} />

            <Animated.View style={{opacity: this.state.messageInputOpacity, position: 'absolute', left: 0, top: 22, flexDirection: 'row', alignItems: 'center', paddingLeft: 20}}>
              <MaterialIcons style={{fontSize: 16, color: '#777', marginRight: 8}} name={'chat'} />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View> : null}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    height: height,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
