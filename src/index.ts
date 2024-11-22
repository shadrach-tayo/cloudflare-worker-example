import { err as serialiseErr } from 'pino-std-serializers';
import { Pool } from 'pg';

export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "HYPERDRIVE" with the variable name you defined.
	HYPERDRIVE: Hyperdrive;
	ENVIRONMENT: 'dev' | 'staging' | 'production';
	POSTGRES_OBJECT: DurableObject<{}>;
}

import { DurableObject } from 'cloudflare:workers';

export class PostgresObject extends DurableObject {
	private DATABASE_URL: string;

	constructor(public state: DurableObjectState, env: Env) {
		super(state, env);
		this.state = state;
		this.env = env;

		this.DATABASE_URL = env.ENVIRONMENT === 'dev' ? 'postgresql://user:password@localhost:5432/database' : env.HYPERDRIVE.connectionString;
	}

	async queryDb(): Promise<Response> {
		try {
			// Create a database client that connects to our database via Hyperdrive
			// Hyperdrive generates a unique connection string you can pass to
			// supported drivers, including node-postgres, Postgres.js, and the many
			// ORMs and query builders that use these drivers.
			const pool = new Pool({ connectionString: this.DATABASE_URL });
			const client = await pool.connect();

			const result = await client.query(`SELECT Count(*) FROM "User";`, []);

			client.release();

			return Response.json({ result: result.rows });
		} catch (err) {
			console.log('[Error:]', { error: serialiseErr(err as Error) });
			return new Response(JSON.stringify({ error: serialiseErr(err as Error) }), { status: 400 });
		}
	}
}

export default {
	async fetch(request, env: Env, ctx): Promise<Response> {
		let url = new URL(request.url);
		let roomIdParam = url.searchParams.get('roomId');

		console.log({ roomIdParam, env: JSON.stringify(env) });

		try {
			// Every unique ID refers to an individual instance of the Durable Object class
			const id = env.POSTGRES_OBJECT.idFromName(roomIdParam ?? 'global');

			// A stub is a client used to invoke methods on the Durable Object
			const stub = env.POSTGRES_OBJECT.get(id);

			// Methods on the Durable Object are invoked via the stub
			const rpcResponse = (await stub.queryDb()) as Response;
			return rpcResponse; // new Response.json(json);
		} catch (e) {
			console.log(e);
			return Response.json({ error: serialiseErr(e as Error) }, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
