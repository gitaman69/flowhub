import { ProviderNotFoundError } from "@flowhub/errors";

export interface QueueBackend {
  name: string;
  enqueue(job: unknown): Promise<void>;
  dequeue(): Promise<unknown | undefined>;
}

export class MemoryQueueBackend implements QueueBackend {
  readonly name = "memory";
  private jobs: unknown[] = [];

  async enqueue(job: unknown): Promise<void> {
    this.jobs.push(job);
  }

  async dequeue(): Promise<unknown | undefined> {
    return this.jobs.shift();
  }
}

export class QueueRegistry {
  private backends = new Map<string, QueueBackend>();

  register(backend: QueueBackend): void {
    this.backends.set(backend.name, backend);
  }

  get(name: string): QueueBackend {
    const backend = this.backends.get(name);
    if (!backend) throw new ProviderNotFoundError("queue", name);
    return backend;
  }

  async enqueue(backendName: string, job: unknown): Promise<void> {
    return this.get(backendName).enqueue(job);
  }

  async dequeue(backendName: string): Promise<unknown | undefined> {
    return this.get(backendName).dequeue();
  }
}
