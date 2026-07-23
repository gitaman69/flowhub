# @flowhub/storage

Provider-agnostic object storage registry — S3, Cloudinary, Google Cloud Storage, Azure Blob, MinIO, or anything else that can implement `upload()`.

← [Back to root README](../../README.md) · Part of the [FlowKit](../../README.md) toolkit.

## Install

```bash
pnpm add @flowhub/storage @flowhub/core @flowhub/errors
```

## API

### `interface StorageProvider`

```ts
interface StorageProvider {
  name: string;
  upload(key: string, data: Uint8Array | string): Promise<{ url: string }>;
}
```

### `class StorageRegistry`

```ts
new StorageRegistry(events?: EventBus)
```

| Method | Description |
|---|---|
| `register(provider)` | Add a provider under `provider.name` |
| `get(name)` | Look up a provider; throws `ProviderNotFoundError` if unregistered |
| `upload(name, key, data)` | Dispatch to the named provider's `upload()`, then emit `storage.uploaded` |

## Events

| Event | Payload | Emitted when |
|---|---|---|
| `storage.uploaded` | `{ provider, key, url }` | `upload()` resolves |

## Usage

### Implementing an S3 provider

```ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { StorageRegistry } from "@flowhub/storage";

const s3 = new S3Client({ region: "us-east-1" });
const storage = new StorageRegistry(app.events);

storage.register({
  name: "s3",
  async upload(key, data) {
    await s3.send(new PutObjectCommand({ Bucket: "my-bucket", Key: key, Body: data }));
    return { url: `https://my-bucket.s3.amazonaws.com/${key}` };
  },
});

const { url } = await storage.upload("s3", `avatars/${userId}.png`, buffer);
```

### Swapping S3 for Cloudinary without touching call sites

```ts
storage.register({
  name: "cloudinary",
  async upload(key, data) {
    const result = await cloudinary.uploader.upload(data, { public_id: key });
    return { url: result.secure_url };
  },
});

await storage.upload("cloudinary", `avatars/${userId}.png`, buffer); // same call shape as "s3"
```

### Reacting to every upload, regardless of provider

```ts
app.events.on("storage.uploaded", ({ provider, key, url }) => {
  db.assets.insert({ provider, key, url, uploadedAt: new Date() });
});
```

## Related packages

- [`@flowhub/core`](../core/README.md) — `EventBus` this registry emits onto
- [`@flowhub/errors`](../errors/README.md) — `ProviderNotFoundError`
- [`@flowhub/cache`](../cache/README.md) — cache signed URLs instead of regenerating them per request
