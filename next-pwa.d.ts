declare module "next-pwa" {
  const nextPwa: (options: Record<string, unknown>) => (config: Record<string, unknown>) => Record<string, unknown>;
  export default nextPwa;
}
