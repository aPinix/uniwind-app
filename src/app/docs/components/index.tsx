import {
  DocsLinkCard,
  DocsScreen,
  DocsSection,
} from '@/components/docs/docs-screen';
import { AppIcon, UiIcon } from '@/components/ui/ui-icon';

export default function ComponentDocsIndex() {
  return (
    <DocsScreen
      description="Focused examples for each component in src/components/ui."
      title="Components"
    >
      <DocsSection title="UI">
        <DocsLinkCard
          description="SF Symbols and local SVG icons through UiIcon."
          href="/docs/components/icon"
          icon={<UiIcon color="#2563eb" name={AppIcon.BullsEye} size={24} />}
          title="Icon"
        />
        <DocsLinkCard
          description="Plain, leading icon, and trailing icon button examples."
          href="/docs/components/buttons"
          icon={<UiIcon color="#7c3aed" name="button.programmable" size={24} />}
          title="Buttons"
        />
        <DocsLinkCard
          description="Background and overlay variants for UiBottomSheet."
          href="/docs/components/bottom-sheet"
          icon={
            <UiIcon
              color="#0891b2"
              name="rectangle.bottomthird.inset.filled"
              size={24}
            />
          }
          title="Bottom Sheet"
        />
      </DocsSection>
    </DocsScreen>
  );
}
