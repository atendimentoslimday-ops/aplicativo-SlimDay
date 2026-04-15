import { Button } from "@/components/ui/button";

const StickyCTA = () => (
  <div className="fixed left-0 right-0 bottom-0 z-40 bg-card/95 border-t border-border py-2.5 px-4 flex justify-center backdrop-blur-sm">
    <a href="#quiz">
      <Button variant="cta" className="rounded-xl">Começar meu plano</Button>
    </a>
  </div>
);

export default StickyCTA;
