import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
} from 'react-native';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import cn from 'classnames';
import useLLM from 'usellm';
import {TypingAnimation} from 'react-native-typing-animation';

const currentDate = new Date().toISOString().slice(0, 10);

const systemMessage = {
  role: 'system',
  content: `You are AI Chat, a helpful assistant developed by Jovian. Answer as concisely as possible. Knowledge cutoff: 2021-09 Current date: ${currentDate}`,
};

type ChatItem = {
  id?: string;
  role: string;
  content: string;
};

const ChatScreen = ({}) => {
  const [message, setMessage] = useState<string>('');
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [keyboardStatus, setKeyboardStatus] = useState(false);

  const llm = useLLM({serviceUrl: 'https://usellm.org/api/llm'});

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (chatList.length > 0) {
      flatListRef.current?.scrollToIndex({
        index: chatList.length - 1,
      });
    }
  }, [chatList]);

  useEffect(() => {
    if (chatList.length > 0 && keyboardStatus) {
      flatListRef.current?.scrollToIndex({
        index: chatList.length - 1,
      });
    }
  }, [keyboardStatus, chatList.length]);

  const sendMessage = async () => {
    const userMessage = {
      id: uuid(),
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    const history = [...chatList, userMessage];
    const messageContext = [systemMessage, ...history].map(msg => ({
      content: msg.content,
      role: msg.role,
    }));

    setChatList(history);
    setMessage('');
    setSending(true);

    try {
      const {message: assistantMessage} = await llm.chat({
        messages: messageContext,
        stream: false,
      });
      setChatList([...history, assistantMessage]);
      setSending(false);
    } catch (error) {
      console.error(error);
      setChatList(history.splice(0, history.length - 1));
      setMessage(message);
      setSending(false);
    }
  };

  const renderItem = ({item}: any) => {
    const isAssistant = item.role === 'assistant';
    return (
      <View
        className={cn(isAssistant ? 'flex-row' : 'flex-row-reverse', 'mb-2')}>
        <View
          className={cn(
            ' text-white px-4 py-2 mb-2 max-w-70p rounded-lg font-medium',
            isAssistant
              ? 'self-start bg-gray-500 rounded-bl-none'
              : 'self-end bg-blue-500 rounded-br-none',
          )}>
          <Text className="text-white text-sm">{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 pt-2 bg-white dark:bg-gray-900">
      <FlatList
        ref={flatListRef}
        data={chatList}
        renderItem={renderItem}
        keyExtractor={item => item.id || uuid()}
        className="px-4"
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 200));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
            });
          });
        }}
        ListFooterComponent={() =>
          sending ? (
            <View className="h-8 flex-row">
              <TypingAnimation
                dotColor="rgb(107 114 128)"
                dotMargin={6}
                dotAmplitude={4}
                dotSpeed={0.12}
                dotRadius={2.5}
                dotX={15}
                dotY={8}
              />
            </View>
          ) : null
        }
      />
      <View className="flex-row items-center p-2 bg-slate-200 dark:bg-slate-800">
        <TextInput
          className="flex-1 bg-white dark:bg-gray-500 rounded-3xl px-4 py-2 mr-2 text-black dark:text-white"
          value={message}
          onChangeText={setMessage}
          placeholder="Ask me anything"
        />
        <TouchableOpacity
          className={cn(
            'rounded-3xl text-white bg-blue-500 px-4 h-full',
            (!message || sending) && 'opacity-50',
          )}
          style={[styles.sendButton]}
          onPress={sendMessage}
          disabled={sending || !message}>
          <Text className="text-white text-base">Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default ChatScreen;
