---
name: git-cli
description: git CLI rules
---

Always cd to the current repository before running git commands:

```bash
cd ~current_repo~ && git <command>
```

This ensures git commands run in the correct repository context.
