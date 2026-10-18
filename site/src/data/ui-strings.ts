import type { SupportedLocale } from "./translations";

/**
 * Small UI strings added during the redesign (a11y labels, controls, microcopy).
 * Anything missing for a locale falls back to English — see `getUi`.
 */
const en = {
  skipToContent: "Skip to content",
  menu: "Menu",
  themeLabel: "Theme",
  themeLight: "Light",
  themeDark: "Dark",
  themeCustom: "Custom",
  openTerminal: "Open terminal",
  close: "Close",
  prev: "Previous image",
  next: "Next image",
  openImage: "Open image full screen",
  imageUnavailable: "Image unavailable",
  videoUnavailable: "The video couldn’t be loaded.",
  watchElsewhere: "Watch on YouTube",
  play: "Play",
  pause: "Pause",
  mute: "Mute",
  unmute: "Unmute",
  fullscreen: "Fullscreen",
  seek: "Seek",
  scroll: "Scroll",
  tracks: "Two tracks, one mindset",
  openPage: "Open page",
  backToTop: "Back to top",
  mailtoHint: "Sending opens your email app with the message prefilled.",
  stack: "Creative stack",
  returnHome: "Return home",
  notFoundTitle: "Command not found.",
  notFoundText: "That route doesn’t exist. Try one of the pages below.",
  progress: "Scroll progress",
  languages: "Language",
};
export type UiStrings = typeof en;

const partial: Record<SupportedLocale, Partial<UiStrings>> = {
  en,
  ne: {
    skipToContent: "सामग्रीमा जानुहोस्", menu: "मेनु", themeLabel: "थिम", themeLight: "उज्यालो", themeDark: "अँध्यारो", themeCustom: "कस्टम",
    openTerminal: "टर्मिनल खोल्नुहोस्", close: "बन्द गर्नुहोस्", prev: "अघिल्लो तस्बिर", next: "अर्को तस्बिर", imageUnavailable: "तस्बिर उपलब्ध छैन",
    videoUnavailable: "भिडियो लोड हुन सकेन।", watchElsewhere: "YouTube मा हेर्नुहोस्", play: "चलाउनुहोस्", pause: "रोक्नुहोस्", mute: "म्यूट", unmute: "अनम्यूट",
    fullscreen: "पूर्ण स्क्रिन", scroll: "स्क्रोल", backToTop: "माथि जानुहोस्", returnHome: "गृहपृष्ठमा फर्कनुहोस्", languages: "भाषा",
  },
  hi: {
    skipToContent: "सामग्री पर जाएँ", menu: "मेनू", themeLabel: "थीम", themeLight: "लाइट", themeDark: "डार्क", themeCustom: "कस्टम",
    openTerminal: "टर्मिनल खोलें", close: "बंद करें", prev: "पिछली छवि", next: "अगली छवि", imageUnavailable: "छवि उपलब्ध नहीं",
    videoUnavailable: "वीडियो लोड नहीं हो सका।", watchElsewhere: "YouTube पर देखें", play: "चलाएँ", pause: "रोकें", mute: "म्यूट", unmute: "अनम्यूट",
    fullscreen: "फ़ुल स्क्रीन", scroll: "स्क्रॉल", backToTop: "ऊपर जाएँ", returnHome: "होम पर लौटें", languages: "भाषा",
  },
  zh: {
    skipToContent: "跳到内容", menu: "菜单", themeLabel: "主题", themeLight: "浅色", themeDark: "深色", themeCustom: "自定义",
    openTerminal: "打开终端", close: "关闭", prev: "上一张", next: "下一张", imageUnavailable: "图片不可用",
    videoUnavailable: "无法加载视频。", watchElsewhere: "在 YouTube 观看", play: "播放", pause: "暂停", mute: "静音", unmute: "取消静音",
    fullscreen: "全屏", scroll: "滚动", backToTop: "返回顶部", returnHome: "返回首页", languages: "语言",
  },
};

export const getUi = (locale: SupportedLocale): UiStrings => ({ ...en, ...partial[locale] });
