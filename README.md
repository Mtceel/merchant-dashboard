# Merchant Dashboard

React + TypeScript dashboard for merchants to manage products, orders, and settings.

## Features

- ✅ Product management (CRUD)
- ✅ Order viewing
- ✅ Sales analytics
- ✅ Store settings
- ✅ Blue/Green deployment

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Deploy

```bash
# Deploy to Blue (production)
kubectl apply -f k8s/deployment-blue.yaml

# Deploy to Green (canary)
kubectl apply -f k8s/deployment-green.yaml

# Promote Green to Blue
./scripts/promote-green-to-blue.sh
```
