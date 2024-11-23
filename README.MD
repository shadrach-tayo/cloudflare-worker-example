#### Cloudflare worker + Durable Objects bindings + Hyperdrive + Postgres storage Example

An example repository showcasing how to implement a Cloudflare worker + DurableObjects binding + Hyperdrive (Postgres) integration

### Quick Setup
```bash
## Login your cloudflare account
npx wrangler login 

## Create a hyperdrive connection to your existing database
npx wrangler hyperdrive create hyperdrive-name --connection-string="postgresql://user:password@localhost:5432/database"

```
[How to setup hyperdrive + remote postgres database ](https://developers.cloudflare.com/hyperdrive/configuration/connect-to-postgres/)

Replace `postgresql://user:password@localhost:5432/database` in src/index.ts with your local database connection string

```bash
# In your terminal
export WRANGLER_HYPERDRIVE_LOCAL_CONNECTION_STRING_NODES_DB=<localConnectionString> 
```

Feel free to play around with the code in src/index.js to change the database query

#### Run
```bash
yarn dev
```

### Deploy 
```bash
# I added a staging config to the wrangler.toml but you can also remove the env arg or change it to production

npx wrangler deploy --env staging 
```

## Happy Hacking 🎉