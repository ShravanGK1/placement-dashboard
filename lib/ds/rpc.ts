export type RpcRequest = {
  jsonrpc: "2.0";
  method: string;
  params?: any;
  id?: string | number | null;
};

export type RpcResponse = {
  jsonrpc: "2.0";
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number | null;
};

type RpcMethod = (params: any) => Promise<any> | any;

class RpcRegistry {
  private methods = new Map<string, RpcMethod>();

  register(methodName: string, handler: RpcMethod) {
    this.methods.set(methodName, handler);
  }

  async handle(req: RpcRequest): Promise<RpcResponse | null> {
    // Validate request
    if (req.jsonrpc !== "2.0" || typeof req.method !== "string") {
      return this.formatError(req.id || null, -32600, "Invalid Request");
    }

    const handler = this.methods.get(req.method);
    if (!handler) {
      return this.formatError(req.id || null, -32601, "Method not found");
    }

    try {
      const result = await handler(req.params);
      
      // If it's a notification (no id), return null (no response)
      if (req.id === undefined) {
        return null;
      }

      return {
        jsonrpc: "2.0",
        result,
        id: req.id,
      };
    } catch (error: any) {
      return this.formatError(req.id || null, -32000, error.message || "Server error");
    }
  }

  async handleBatch(requests: RpcRequest[]): Promise<(RpcResponse | null)[]> {
    if (!Array.isArray(requests) || requests.length === 0) {
      return [this.formatError(null, -32600, "Invalid Request")];
    }

    const promises = requests.map(req => this.handle(req));
    const results = await Promise.all(promises);
    return results.filter(r => r !== null);
  }

  private formatError(id: string | number | null, code: number, message: string): RpcResponse {
    return {
      jsonrpc: "2.0",
      error: { code, message },
      id,
    };
  }
}

// Global registry instance
export const rpcRegistry = new RpcRegistry();

// Mock methods for demo
rpcRegistry.register("placement.getStats", async () => {
  return {
    totalStudents: 1500,
    placedStudents: 1250,
    activeCompanies: 45,
    averagePackage: "8.5 LPA"
  };
});

rpcRegistry.register("system.ping", () => {
  return "pong";
});

rpcRegistry.register("application.submit", async (params) => {
  if (!params || !params.studentId || !params.jobId) {
    throw new Error("Missing parameters");
  }
  return { success: true, applicationId: `app_${Math.random().toString(36).substring(7)}` };
});
