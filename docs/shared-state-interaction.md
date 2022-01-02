# Whoosh tutorials

## Shared State Interaction

The `on()` and `off()` functions of the Shared State can be used to enforce coherence of several Shared States

```ts
import { createShared } from 'whoosh-react';

const selectorIsEnabled = createShared<boolean>(false);
const selectedIds = createShared<string[]>([]);

// Set `selectedIds` to empty array when `selectorIsEnabled` becomes false
selectorIsEnabled.on(isEnabled => {
    if(!isEnabled) selectedIds.set([]);
});

// Set `selectorIsEnabled` to true when `selectedIds` length becomes more than zero
selectedIds.on(ids => {
    if(ids.length > 0 && !selectorIsEnabled.get()) selectorIsEnabled.set(true); 
});
```
