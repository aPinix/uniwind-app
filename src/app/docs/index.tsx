import {
  DocsLinkCard,
  DocsScreen,
  DocsSection,
} from '@/components/docs/docs-screen';
import { AppIcon, UiIcon } from '@/components/ui/ui-icon';

export default function DocsIndex() {
  return (
    <DocsScreen
      description="Examples for the local UI components, styling patterns, and platform integrations in this app."
      title="Docs"
    >
      <DocsSection title="Browse">
        <DocsLinkCard
          description="Icon, button, and bottom sheet examples."
          href="/docs/components"
          icon={<UiIcon color="#2563eb" name={AppIcon.BullsEye} size={24} />}
          meta="3"
          title="Components"
        />
        <DocsLinkCard
          description="Uniwind pseudo-class examples for interactive states."
          href="/docs/styling"
          icon={<UiIcon color="#16a34a" name="paintbrush.fill" size={24} />}
          title="Styling"
        />
        <DocsLinkCard
          description="Platform APIs and examples that do not belong to a component."
          href="/docs/other"
          icon={<UiIcon color="#c2410c" name="star.bubble.fill" size={24} />}
          title="Other"
        />
      </DocsSection>
    </DocsScreen>
  );
}
