import { useReducer, useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WizardContext, wizardReducer, WIZARD_DEFAULT, type StepProps } from "../lib/wizard";
import Step1Taxpayer from "./steps/Step1Taxpayer";
import Step2Address from "./steps/Step2Address";
import Step3Employer from "./steps/Step3Employer";
import Step4Spouse from "./steps/Step4Spouse";
import Step5Review from "./steps/Step5Review";

const SESSION_KEY = "wizard:new-application";

type StepNum = 1 | 2 | 3 | 4 | 5;
const STEP_COMPONENTS: ComponentType<StepProps>[] = [
  Step1Taxpayer, Step2Address, Step3Employer, Step4Spouse, Step5Review,
];

export default function NewApplication() {
  const [state, dispatch] = useReducer(
    wizardReducer,
    WIZARD_DEFAULT,
    (def) => {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        return stored ? { ...def, ...JSON.parse(stored) } : def;
      } catch {
        return def;
      }
    },
  );

  const [nav, setNav] = useState<{ step: StepNum; dir: number }>({ step: 1, dir: 1 });

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [state]);

  function goTo(next: StepNum) {
    setNav((n) => ({ step: next, dir: next > n.step ? 1 : -1 }));
  }

  function clearWizard() {
    sessionStorage.removeItem(SESSION_KEY);
    dispatch({ type: "RESET" });
  }

  const StepComponent = STEP_COMPONENTS[nav.step - 1];

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={nav.step}
          initial={{ x: nav.dir * 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: nav.dir * -40, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <StepComponent
            onNext={() => goTo((nav.step + 1) as StepNum)}
            onBack={() => goTo((nav.step - 1) as StepNum)}
            clearWizard={clearWizard}
            onGoTo={(s) => goTo(s as StepNum)}
          />
        </motion.div>
      </AnimatePresence>
    </WizardContext.Provider>
  );
}
