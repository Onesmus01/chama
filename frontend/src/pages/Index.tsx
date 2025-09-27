import { FinancialCarousel } from "../components/FinancialCarousel";
import Home from "./Home";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <FinancialCarousel />
      <Home />
    </div>
  );
};

export default Index;
