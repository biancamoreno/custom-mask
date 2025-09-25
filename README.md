# Custom Mask

**Custom Mask** é uma engine de máscaras de texto escrita em **TypeScript**, projetada para ser simples, flexível e extensível.  
Ela resolve casos de uso comuns de formatação de entrada — como telefones, documentos, valores monetários e identificadores alfanuméricos — sem adicionar dependências externas.

---

## Funcionalidades

- **Máscaras declarativas**: defina padrões simples diretamente em string.
- **Alternador de máscaras**: suporte a múltiplos padrões, selecionando automaticamente o mais adequado por **RegEx** ou **comprimento**.
- **Grupos opcionais e literais fixos**: insira caracteres como espaços, pontos ou hífens apenas quando necessário.
- **Escapador de caracteres**: use `\\` para transformar tokens reservados em literais.
- **Formatação numérica**: suporte a moeda, percentuais e números grandes com prefixo, sufixo, separador decimal, delimitador de milhar e casas decimais configuráveis.
- **Configuração via objeto**: flexível e compatível com definições em JSON.
- **Sem dependências externas**: engine pequena e independente.

---

## Instalação

```bash
npm install @biancamoreno/custom-mask
# ou
yarn add @biancamoreno/custom-mask
```

---

## Tokens

| Token | Descrição |
| ----- | --------- |
| `9`   | número (0–9) |
| `A`   | letra (a–z, A–Z) |
| `*`   | qualquer caractere alfanumérico |
| Literais (`.`, `-`, `/`, `:` etc) | aparecem fixos |
| `[ ]` | grupo opcional |
| `\\`  | escapa um caractere reservado |

---

## Exemplos de uso

### Máscara fixa

```tsx
applyCustomMask("5511912345678", "+99 (99) [9 ]9999-9999")
// { masked: "+55 (11) 9 1234-5678", unmasked: "5511912345678" }
```

### Alternador de máscara

```tsx
applyCustomMask("ABC1234", [
  { mask: 'AAA-9*99' },
  { mask: 'AAA9A99', regex: /^[A-Z]{3}\d[A-Z].*/i }
])
// { masked: "ABC-1234", unmasked: "ABC1234" }

applyCustomMask("BRA1E23", [
  { mask: 'AAA-9*99' },
  { mask: 'AAA9A99', regex: /^[A-Z]{3}\d[A-Z].*/i }
])
// { masked: "BRA1E23", unmasked: "BRA1E23" }
```

### Máscara numérica

```tsx
applyCustomMask("123456", {
  prefix: "USD ",
  separator: ".",
  delimiter: ",",
  decimal: 2
})
// { masked: "USD 1,234.56", unmasked: "1234.56" }
```

### Outros exemplos

**Real (R$) com sufixo**
```tsx
applyCustomMask("123456", { prefix: "R$ ", suffix: " reais", decimal: 2 })
// { masked: "R$ 1.234,56 reais", unmasked: "1234.56" }
```

**Boleto bancário**
```tsx
applyCustomMask("34191790010104351004791020150008291070026000", 
  "99999.99999 99999.999999 99999.999999 9 99999999999999"
)
// { masked: "34191.79001 01043.510047 91020.150008 2 91070026000", unmasked: "34191790010104351004791020150008291070026000" }
```

**Cartão de crédito**
```tsx
applyCustomMask("4111111111111111", "9999 9999 9999 9999")
// { masked: "4111 1111 1111 1111", unmasked: "4111111111111111" }
```

**RG alfanumérico**
```tsx
applyCustomMask("123456789", [
  { mask: '*9.999.999-9' },
  { mask: 'A-99.999.999', regex: /^[a-zA-Z]/ }
])
// { masked: "12.345.678-9", unmasked: "123456789" }

applyCustomMask("A12345678", [
  { mask: '*9.999.999-9' },
  { mask: 'A-99.999.999', regex: /^[a-zA-Z]/ }
])
// { masked: "A-12.345.678", unmasked: "A12345678" }
```

---

## Ferramentas utilizadas

- **TypeScript** para tipagem estática
- **Jest** para testes unitários

---

## Compatibilidade

- Funciona em qualquer projeto JavaScript/TypeScript (Node.js >= 14, ES2019+).
- Pronto para uso em:
  - **React 18+**
  - **React Native 0.72+**

> Em browsers modernos (ES2019+ - Chrome 80+, Safari 14+, Edge 80+) funciona sem polyfills.  
> Para ambientes legados, adicione polyfills para recursos recentes de arrays e strings.

---

## Roadmap

- [ ] Playground interativo para criar, visualizar e testar máscaras em tempo real
- [ ] Hook React (`useCustomMask`) para facilitar integração com inputs controlados
- [ ] Presets prontos para formatos comuns

