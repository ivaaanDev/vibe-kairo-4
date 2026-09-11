import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const NUCLEO = ["lib/dominio/**", "lib/tipos/**", "lib/servicios/**", "lib/estado/**", "lib/diseno/**"];

const configuracion = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "playwright-report/**", "test-results/**", ".kairo-local/**"],
  },
  {
    // El núcleo de dominio no puede depender de infraestructura ni de la interfaz.
    // Las pruebas sí pueden montar adaptadores en memoria.
    files: NUCLEO,
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react/*", "react-dom", "next", "next/*", "@supabase/*", "motion", "motion/*", "lucide-react", "node:*", "@/app/*", "@/lib/adaptadores/*"],
              message: "El núcleo de Kairo no depende de infraestructura ni de la interfaz.",
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];

export default configuracion;
