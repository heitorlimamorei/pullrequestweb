const config = {
  template:
    "Descrição do PR\nEste PR abrange uma série de melhorias e novos recursos para o módulo de cartão de crédito. Abaixo está um resumo detalhado das mudanças:\n\n#### Novos Recursos e Funcionalidades\n\nMódulo de Cartão de Crédito:\n- Adicionados funcionalidades para aumentar e diminuir o limite do cartão.\n- Métodos e utilidades para gerenciar parcelamentos.\n\nUtilitários e Tipos:\n- Inclusão de novos utilitários para gerenciamento de parcelas.\n- Adicionadas definições de tipos e DTOs (Data Transfer Objects) para operações de criação, atualização e consulta.\n\nMétodos Adicionais:\n- Método resolveAvalibleLimitDelta adicionado para calcular o delta de limite disponível.\n- Adição parcial de novos itens ao módulo de cartão de crédito.\n\nAtualizações Gerais:\n- Exports organizados e propriedades adicionais incorporadas nos DTOs.\n- Atualizações e correções de indentação.\n\n#### Correções de Bugs\n\nCorreção de Typos:\n- Diversos erros de digitação foram corrigidos em diferentes partes do código.\n- Caminhos de URL corrigidos no middleware do Express para o método PUT.\n\n#### Como Testar\n\nVerifique as novas funcionalidades de incremento e decremento de limite de cartão.\nRealize testes nos métodos de utilitários de parcelamento.\nTeste as operações CRUD utilizando os novos DTOs para atualização, criação e consulta.\nGaranta que o método resolveAvalibleLimitDelta realiza os cálculos corretamente.\nConfirme se todas as correções de typos e caminhos estão funcionando conforme esperado no middleware do Express.\n\n#### Notas Adicionais\nEste PR inclui commits realizados no dia 20 de julho de 2024, e ontem",
  base_prompt:
    "Você é um assistant capaz de análisar commits que ocorram no contexto de criação de um pull request, ou seja, os commits que diferenciam a base branch da head branch.",
  analysis_prompt:
    "Você deve análisar os commits levando em conta a message que descreve o que foi commitado e o diff que é são todas as alterações que foram feitas no código neste commit.",
  description_prompt:
    "Com base na análise dos commits você deve gerar uma descrição para o pull request seguindo o template a seguir: ",
};

const readBasePrompt = () => {
  return `${config.base_prompt} ${config.analysis_prompt} ${config.description_prompt}: ${config.template}`;
};

window.basePrompt = readBasePrompt;