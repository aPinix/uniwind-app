import { type Href, Link, Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { cn } from '@/lib/utils';

interface DocsScreenProps {
  title: string;
  description?: string;
  children: ReactNode;
}

interface DocsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

interface DocsLinkCardProps {
  href: Href;
  title: string;
  description: string;
  icon?: ReactNode;
  meta?: string;
}

interface DocsExamplePanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function DocsScreen({ title, description, children }: DocsScreenProps) {
  return (
    <>
      <Stack.Screen options={{ title }} />
      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950">
        <View className="w-full max-w-3xl gap-6 self-center px-5 py-8">
          <View className="gap-2">
            <Text className="font-bold text-3xl text-slate-950 dark:text-white">
              {title}
            </Text>
            {description && (
              <Text className="text-base text-slate-600 dark:text-slate-300">
                {description}
              </Text>
            )}
          </View>
          {children}
        </View>
      </ScrollView>
    </>
  );
}

export function DocsSection({
  title,
  description,
  children,
}: DocsSectionProps) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="font-bold text-slate-950 text-xl dark:text-white">
          {title}
        </Text>
        {description && (
          <Text className="text-slate-600 dark:text-slate-300">
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

export function DocsLinkCard({
  href,
  title,
  description,
  icon,
  meta,
}: DocsLinkCardProps) {
  return (
    <Link asChild href={href}>
      <Pressable className="flex-row items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 active:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:active:bg-slate-800">
        {icon && (
          <View className="h-11 w-11 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
            {icon}
          </View>
        )}
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="font-bold text-base text-slate-950 dark:text-white">
              {title}
            </Text>
            {meta && (
              <Text className="text-slate-500 text-xs uppercase dark:text-slate-400">
                {meta}
              </Text>
            )}
          </View>
          <Text className="text-slate-600 text-sm dark:text-slate-300">
            {description}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export function DocsExamplePanel({
  title,
  children,
  className,
}: DocsExamplePanelProps) {
  return (
    <View
      className={cn(
        'gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
        className
      )}
    >
      {title && (
        <Text className="font-bold text-base text-slate-950 dark:text-white">
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
