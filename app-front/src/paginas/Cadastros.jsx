import "./Cadastros.css";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

const sectionConfig = {
  cliente: {
    title: "Clientes",
    intro:
      "Gerencie os responsaveis pelos pets com dados claros para contato e relacionamento.",
    actionLabel: "Novo cliente",
    endpoint: "pessoas",
    emptyLabel: "Nenhum cliente cadastrado ainda.",
    fields: [
      {
        name: "nome",
        label: "Nome",
        type: "text",
        placeholder: "Ex.: Ana Martins",
        required: true,
        maxLength: 100,
      },
      {
        name: "telefone",
        label: "Telefone",
        type: "text",
        inputMode: "numeric",
        required: true,
        pattern: "[0-9]{2} [0-9]{4,5}-[0-9]{4}",
        title: "Informe o DDD e um telefone com 10 ou 11 dígitos.",
        placeholder: "41 99999-9999",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "ana@email.com",
        required: true,
        maxLength: 254,
      },
    ],
    columns: [
      { key: "id", label: "ID" },
      { key: "nome", label: "Nome" },
      { key: "telefone", label: "Telefone" },
      { key: "email", label: "Email" },
    ],
    createEmpty: () => ({ nome: "", telefone: "", email: "" }),
  },
  animal: {
    title: "Animais",
    intro:
      "Organize os pets atendidos com informacoes objetivas para consulta rapida.",
    actionLabel: "Novo animal",
    endpoint: "animais",
    emptyLabel: "Nenhum animal cadastrado ainda.",
    fields: [
      {
        name: "nomeAnimal",
        label: "Nome do pet",
        type: "text",
        placeholder: "Ex.: Thor",
        required: true,
        maxLength: 100,
      },
      {
        name: "raca",
        label: "Raca",
        type: "text",
        placeholder: "Ex.: Golden Retriever",
        required: true,
        maxLength: 100,
      },
      {
        name: "porte",
        label: "Porte",
        type: "text",
        placeholder: "Ex.: Medio",
        required: true,
        maxLength: 50,
      },
    ],
    columns: [
      { key: "id", label: "ID" },
      { key: "nomeAnimal", label: "Nome" },
      { key: "raca", label: "Raca" },
      { key: "porte", label: "Porte" },
    ],
    createEmpty: () => ({ nomeAnimal: "", raca: "", porte: "" }),
  },
  produto: {
    title: "Produtos",
    intro:
      "Mantenha o catalogo da loja pronto para apresentar itens e servicos ao cliente.",
    actionLabel: "Novo produto",
    endpoint: "produtos",
    emptyLabel: "Nenhum produto cadastrado ainda.",
    fields: [
      {
        name: "nomeProduto",
        label: "Nome",
        type: "text",
        placeholder: "Ex.: Shampoo antialergico",
        maxLength: 100,
        required: true,
      },
      {
        name: "descricao",
        label: "Descricao",
        type: "text",
        placeholder: "Hidratacao para peles sensiveis",
        maxLength: 500,
        required: true,
      },
      {
        name: "preco",
        label: "Preço",
        type: "text",
        inputMode: "decimal",
        placeholder: "Ex.: 39,90",
        required: true,
        pattern: "[0-9]{1,8}(,[0-9]{1,2})?",
        title: "Informe um preço maior que zero, como 39,90.",
      },
    ],
    columns: [
      { key: "id", label: "ID" },
      { key: "nomeProduto", label: "Nome" },
      { key: "descricao", label: "Descricao" },
      { key: "preco", label: "Preço" },
    ],
    createEmpty: () => ({ nomeProduto: "", descricao: "", preco: "" }),
  },
};

const sectionOrder = ["cliente", "animal", "produto"];

function sanitizeDecimalInput(value) {
  const cleaned = String(value ?? "").replace(/[^\d.,]/g, "");
  const firstSeparator = cleaned.search(/[.,]/);

  if (firstSeparator === -1) {
    return cleaned.slice(0, 8);
  }

  const integerPart = cleaned
    .slice(0, firstSeparator)
    .replace(/[.,]/g, "")
    .slice(0, 8);
  const decimalPart = cleaned
    .slice(firstSeparator + 1)
    .replace(/[.,]/g, "")
    .slice(0, 2);

  return decimalPart ? `${integerPart},${decimalPart}` : `${integerPart},`;
}

function getSaveErrorMessage(error, config) {
  const errors = error.response?.data?.errors;

  if (errors && typeof errors === "object") {
    const messages = Object.entries(errors).flatMap(
      ([fieldName, fieldErrors]) => {
        const field = config.fields.find(
          (item) => item.name.toLowerCase() === fieldName.toLowerCase(),
        );

        const label = field?.label ?? fieldName;
        const fieldMessages = Array.isArray(fieldErrors)
          ? fieldErrors
          : [fieldErrors];

        return fieldMessages
          .filter(Boolean)
          .map((message) => `${label}: ${message}`);
      },
    );

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return (
    error.response?.data?.detail ??
    error.response?.data?.title ??
    `Nao foi possivel salvar ${config.title.toLowerCase()}.`
  );
}

function formatPhoneInput(value) {
  const digits = String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizePrice(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const text = String(value).trim().replace(/\s+/g, "");
  let normalized = text;

  if (text.includes(",") && text.includes(".")) {
    normalized = text.replace(/\./g, "").replace(",", ".");
  } else if (text.includes(",")) {
    normalized = text.replace(",", ".");
  }

  const numericValue = Number(normalized);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return Number(numericValue.toFixed(2));
}

function formatPriceForInput(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numericValue = normalizePrice(value);

  if (numericValue === "") {
    return "";
  }

  return numericValue.toFixed(2).replace(".", ",");
}

function Cadastros() {
  const apiBaseUrl = process.env.REACT_APP_API_URL ?? "http://localhost:5119";

  const [forms, setForms] = useState({
    cliente: null,
    animal: null,
    produto: null,
  });
  const [data, setData] = useState({
    cliente: [],
    animal: [],
    produto: [],
  });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  async function loadSection(type) {
    const config = sectionConfig[type];
    const response = await axios.get(`${apiBaseUrl}/${config.endpoint}`);

    setData((current) => ({
      ...current,
      [type]: response.data,
    }));
  }

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all(sectionOrder.map((type) => loadSection(type)));
      setFeedback({ type: "", message: "" });
    } catch {
      setFeedback({
        type: "error",
        message:
          "Nao foi possivel carregar os dados da API. Verifique se o backend esta ativo.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openNewForm(type) {
    setForms((current) => ({
      ...current,
      [type]: sectionConfig[type].createEmpty(),
    }));
  }

  function cancelForm(type) {
    setForms((current) => ({
      ...current,
      [type]: null,
    }));
  }

  function updateForm(type, field, value) {
    let nextValue = value;

    if (type === "produto" && field === "preco") {
      nextValue = sanitizeDecimalInput(value);
    }

    if (type === "cliente" && field === "telefone") {
      nextValue = formatPhoneInput(value);
    }

    setForms((current) => {
      const updated = {
        ...current,
        [type]: {
          ...current[type],
          [field]: nextValue,
        },
      };

      return updated;
    });
  }

  function blurPriceInput(type) {
    if (type !== "produto") {
      return;
    }

    setForms((current) => {
      const produto = current.produto;

      if (!produto) {
        return current;
      }

      const normalizedPrice = normalizePrice(produto.preco);

      if (normalizedPrice === "" || Number.isNaN(normalizedPrice)) {
        return current;
      }

      return {
        ...current,
        produto: {
          ...produto,
          preco: formatPriceForInput(normalizedPrice),
        },
      };
    });
  }

  async function saveForm(type) {
    const config = sectionConfig[type];
    const form = forms[type];
    let payload = { ...form };

    if (type === "produto") {
      payload.preco = normalizePrice(form.preco);
    }

    if (type === "cliente") {
      payload.telefone = normalizePhone(form.telefone);
    }

    try {
      if (form.id) {
        await axios.put(`${apiBaseUrl}/${config.endpoint}/${form.id}`, payload);
        setFeedback({
          type: "success",
          message: `${config.title} atualizado com sucesso.`,
        });
      } else {
        await axios.post(`${apiBaseUrl}/${config.endpoint}`, payload);
        setFeedback({
          type: "success",
          message: `${config.title} cadastrado com sucesso.`,
        });
      }

      cancelForm(type);
      await loadSection(type);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Falha ao salvar cadastro:",
          error.response?.status,
          error.response?.data ?? error.message,
        );
      }

      setFeedback({
        type: "error",
        message: getSaveErrorMessage(error, config),
      });
    }
  }

  function handleFormSubmit(event, type) {
    event.preventDefault();

    const requiredInputs = Array.from(
      event.currentTarget.querySelectorAll("input[required]"),
    );
    const blankInput = requiredInputs.find((input) => !input.value.trim());

    if (blankInput) {
      blankInput.setCustomValidity("Este campo é obrigatório.");
      blankInput.reportValidity();
      return;
    }

    if (type === "produto") {
      const priceInput = event.currentTarget.elements.namedItem("preco");
      const price = normalizePrice(forms.produto?.preco);

      if (typeof price !== "number" || price <= 0) {
        priceInput.setCustomValidity("Informe um preço maior que zero.");
        priceInput.reportValidity();
        return;
      }

      priceInput.setCustomValidity("");
    }

    saveForm(type);
  }

  async function deleteItem(type, id) {
    const config = sectionConfig[type];

    try {
      await axios.delete(`${apiBaseUrl}/${config.endpoint}/${id}`);
      setFeedback({
        type: "success",
        message: `${config.title} removido com sucesso.`,
      });
      await loadSection(type);
    } catch {
      setFeedback({
        type: "error",
        message: `Nao foi possivel excluir ${config.title.toLowerCase()}.`,
      });
    }
  }

  function editItem(type, item) {
    let formattedItem = { ...item };

    if (type === "produto") {
      formattedItem.preco = formatPriceForInput(item.preco);
    }

    if (type === "cliente") {
      formattedItem.telefone = formatPhoneInput(item.telefone);
    }

    setForms((current) => ({
      ...current,
      [type]: formattedItem,
    }));
  }

  function formatValue(type, key, value) {
    if (type === "cliente" && key === "telefone") {
      return formatPhoneInput(value);
    }

    if (type === "produto" && key === "preco") {
      const numericValue = Number(value);

      if (!Number.isNaN(numericValue)) {
        return numericValue.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      }
    }

    return value || "-";
  }

  const summary = useMemo(() => {
    return {
      clientes: data.cliente.length,
      animais: data.animal.length,
      produtos: data.produto.length,
      total: data.cliente.length + data.animal.length + data.produto.length,
    };
  }, [data]);

  return (
    <section className="cadastros-page">
      <div className="cadastros-hero">
        <div>
          <p className="eyebrow">Area operacional</p>
          <h1 className="section-title">
            Cadastros com mais contexto visual e melhor leitura
          </h1>
          <p className="section-copy">
            Esta tela agora apresenta a operacao do sistema em blocos mais
            claros, com resumos, formularios organizados e tabelas mais
            agradaveis para demonstracao.
          </p>
        </div>

        <div className="summary-grid">
          <article className="summary-card">
            <span>Clientes</span>
            <strong>{summary.clientes}</strong>
          </article>
          <article className="summary-card">
            <span>Animais</span>
            <strong>{summary.animais}</strong>
          </article>
          <article className="summary-card">
            <span>Produtos</span>
            <strong>{summary.produtos}</strong>
          </article>
          <article className="summary-card highlight">
            <span>Total de registros</span>
            <strong>{summary.total}</strong>
          </article>
        </div>
      </div>

      {feedback.message ? (
        <div className={`feedback-banner ${feedback.type}`}>
          {feedback.message}
        </div>
      ) : null}

      {loading ? (
        <div className="feedback-banner">Carregando dados do sistema...</div>
      ) : null}

      <div className="cadastros-grid">
        {sectionOrder.map((type) => {
          const config = sectionConfig[type];
          const form = forms[type];
          const items = data[type];

          return (
            <article className="cadastro-card" key={type}>
              <div className="card-header">
                <div>
                  <p className="eyebrow">{config.title}</p>
                  <h2>{config.title}</h2>
                  <p>{config.intro}</p>
                </div>

                <button
                  className="primary-action"
                  type="button"
                  onClick={() => openNewForm(type)}
                >
                  {config.actionLabel}
                </button>
              </div>

              {form ? (
                <form
                  className="cadastro-form"
                  onSubmit={(event) => handleFormSubmit(event, type)}
                >
                  <div className="form-grid">
                    {config.fields.map((field) => (
                      <label key={field.name}>
                        <span>{field.label}</span>
                        <input
                          type={field.type}
                          required={field.required}
                          maxLength={field.maxLength}
                          pattern={field.pattern}
                          title={field.title}
                          inputMode={field.inputMode}
                          name={field.name}
                          placeholder={field.placeholder}
                          value={form[field.name] ?? ""}
                          onChange={(event) => {
                            event.target.setCustomValidity("");
                            updateForm(type, field.name, event.target.value);
                          }}
                          onBlur={
                            field.name === "preco"
                              ? () => blurPriceInput(type)
                              : undefined
                          }
                        />
                      </label>
                    ))}
                  </div>

                  <div className="form-actions">
                    <button className="primary-action" type="submit">
                      Salvar
                    </button>
                    <button
                      className="secondary-action"
                      type="button"
                      onClick={() => cancelForm(type)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : null}

              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      {config.columns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          className="empty-state"
                          colSpan={config.columns.length + 1}
                        >
                          {config.emptyLabel}
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id}>
                          {config.columns.map((column) => (
                            <td key={column.key}>
                              {formatValue(type, column.key, item[column.key])}
                            </td>
                          ))}
                          <td>
                            <div className="table-actions">
                              <button
                                className="secondary-action"
                                type="button"
                                onClick={() => editItem(type, item)}
                              >
                                Editar
                              </button>
                              <button
                                className="danger-action"
                                type="button"
                                onClick={() => deleteItem(type, item.id)}
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Cadastros;
