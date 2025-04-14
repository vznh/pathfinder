// layouts/MobileLayout.tsx
// * TODO
/*
 * would love if precise location was main view, then theres buttons to show large map
 * should always point forward
 *
 */

type MobileLayoutProps = {
  preciseChild: React.ReactNode;
  mapChild: React.ReactNode;
}

const MobileLayout = ({ preciseChild, mapChild }: MobileLayoutProps) => {
  return (
    <div>
      {/* Your mobile layout content here */}
    </div>
  );
};

export default MobileLayout;
