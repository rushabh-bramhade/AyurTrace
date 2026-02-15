import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Database } from "lucide-react";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { testSupabaseConnection } from "@/utils/testSupabaseConnection";
import type { ConnectionTestResult } from "@/utils/testSupabaseConnection";

const TestConnection = () => {
  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const testResult = await testSupabaseConnection();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: "Test failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Connection Test
            </CardTitle>
            <CardDescription>
              Test your Supabase connection and verify environment variables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleTest} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Skeleton className="mr-2 h-4 w-4 rounded-full bg-white/30 animate-pulse" />
                  Testing Connection...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            {result && (
              <div className="mt-4">
                <div
                  className={`flex items-center gap-2 p-4 rounded-lg ${
                    result.success
                      ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{result.message}</p>
                    {result.details && (
                      <div className="mt-2 text-sm space-y-1">
                        {result.details.url && (
                          <p>
                            <span className="font-medium">URL:</span> {result.details.url}
                          </p>
                        )}
                        {result.details.projectId && (
                          <p>
                            <span className="font-medium">Project ID:</span> {result.details.projectId}
                          </p>
                        )}
                        {result.details.error && (
                          <p className="text-red-600 dark:text-red-400">
                            <span className="font-medium">Error:</span> {result.details.error}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Environment Variables Status:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>VITE_SUPABASE_URL:</span>
                  <span
                    className={
                      import.meta.env.VITE_SUPABASE_URL
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {import.meta.env.VITE_SUPABASE_URL ? "✓ Set" : "✗ Missing"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VITE_SUPABASE_PUBLISHABLE_KEY:</span>
                  <span
                    className={
                      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? "✓ Set" : "✗ Missing"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VITE_SUPABASE_PROJECT_ID:</span>
                  <span
                    className={
                      import.meta.env.VITE_SUPABASE_PROJECT_ID
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {import.meta.env.VITE_SUPABASE_PROJECT_ID ? "✓ Set" : "✗ Missing"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TestConnection;
