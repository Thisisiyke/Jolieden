// AI SMS Concierge simulator — drops the iMessage-style simulator into the
// shared MobileFrame so reviewers see exactly what a client texting the
// Jolieden number experiences.

import MobileFrame from "@/components/MobileFrame";
import SmsSimulator from "@/components/sms/SmsSimulator";

export default function SmsSimulatorPage() {
  return (
    <MobileFrame>
      <SmsSimulator />
    </MobileFrame>
  );
}
