import { ingress } from "./ingress";
import { arbitrate } from "./arbitration";
import { egress } from "./egress";
import { ConsciousWorkspace } from "./conscious";

export class Spine {
  private conscious: ConsciousWorkspace;
  private tickCount = 0;

  constructor(maxConsciousItems = 7) {
    this.conscious = new ConsciousWorkspace(maxConsciousItems);
  }

  tick(input: unknown[]): void {
    this.tickCount++;

    const filtered = ingress(input);
    this.conscious.integrate(filtered);

    const decisions = arbitrate(this.conscious.snapshot());
    this.conscious.apply(decisions);

    egress(this.conscious);
  }

  getTickCount(): number {
    return this.tickCount;
  }
}
