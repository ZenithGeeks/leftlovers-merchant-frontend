import WarningSection from '@/components/feedback/WarningSection';
import FeedbackWrapper from '@/components/Home/Feedback/FeedbackWrapper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { ScrollView } from 'react-native';

export const options = { headerShown: false };

export default function reviews() {
  return (
    <ScrollView className='w-full'>
      <ThemedView className='flex flex-col p-6 gap-4'>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.medium,
          }}
          className='pt-12 font-bold'>
          Feedback
        </ThemedText>
        <FeedbackWrapper/>
        <WarningSection data={[]}/>
      </ThemedView>
    </ScrollView>
  );
}
