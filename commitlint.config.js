export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Nova funcionalidade
        "fix", // Correção de bug
        "docs", // Documentação
        "style", // Formatação (sem mudança de lógica)
        "refactor", // Refatoração
        "perf", // Performance
        "test", // Testes
        "chore", // Manutenção (dependências, scripts)
        "ci", // CI/CD
        "revert", // Reversão de commit
      ],
    ],
    "subject-case": [0], // Permite qualquer case no subject (PT-BR)
    "body-max-line-length": [0], // Sem limite de linha no body
  },
};
