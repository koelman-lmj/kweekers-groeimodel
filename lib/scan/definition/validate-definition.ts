import { categories } from "@/lib/scan/definition/categories";
import { dimensions } from "@/lib/scan/definition/dimensions";
import { optionSets } from "@/lib/scan/definition/option-sets";
import { questions } from "@/lib/scan/definition/questions";

export type DefinitionValidationMessage = {
  type: "error" | "warning";
  source: "categories" | "dimensions" | "optionSets" | "questions";
  message: string;
  reference?: string;
};

export type DefinitionValidationResult = {
  isValid: boolean;
  errors: DefinitionValidationMessage[];
  warnings: DefinitionValidationMessage[];
  messages: DefinitionValidationMessage[];
};

function hasDuplicateValues(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function addMessage(
  messages: DefinitionValidationMessage[],
  message: DefinitionValidationMessage
) {
  messages.push(message);
}

export function validateDefinition(): DefinitionValidationResult {
  const messages: DefinitionValidationMessage[] = [];

  const categoryCodes = categories.map((category) => category.code);
  const dimensionCodes = dimensions.map((dimension) => dimension.code);
  const optionSetKeys = optionSets.map((optionSet) => optionSet.key);
  const questionKeys = questions.map((question) => question.key);

  const duplicateCategoryCodes = unique(hasDuplicateValues(categoryCodes));
  const duplicateDimensionCodes = unique(hasDuplicateValues(dimensionCodes));
  const duplicateOptionSetKeys = unique(hasDuplicateValues(optionSetKeys));
  const duplicateQuestionKeys = unique(hasDuplicateValues(questionKeys));

  duplicateCategoryCodes.forEach((code) => {
    addMessage(messages, {
      type: "error",
      source: "categories",
      reference: code,
      message: `Categoriecode '${code}' komt meerdere keren voor.`,
    });
  });

  duplicateDimensionCodes.forEach((code) => {
    addMessage(messages, {
      type: "error",
      source: "dimensions",
      reference: code,
      message: `Dimensiecode '${code}' komt meerdere keren voor.`,
    });
  });

  duplicateOptionSetKeys.forEach((key) => {
    addMessage(messages, {
      type: "error",
      source: "optionSets",
      reference: key,
      message: `Option set '${key}' komt meerdere keren voor.`,
    });
  });

  duplicateQuestionKeys.forEach((key) => {
    addMessage(messages, {
      type: "error",
      source: "questions",
      reference: key,
      message: `Vraagkey '${key}' komt meerdere keren voor.`,
    });
  });

  dimensions.forEach((dimension) => {
    if (!dimension.code?.trim()) {
      addMessage(messages, {
        type: "error",
        source: "dimensions",
        message: "Er is een dimensie zonder code.",
      });
    }

    if (!dimension.title?.trim()) {
      addMessage(messages, {
        type: "error",
        source: "dimensions",
        reference: dimension.code,
        message: `Dimensie '${dimension.code}' heeft geen titel.`,
      });
    }

    if (!categoryCodes.includes(dimension.category ?? "")) {
      addMessage(messages, {
        type: "warning",
        source: "dimensions",
        reference: dimension.code,
        message: `Dimensie '${dimension.code}' verwijst naar onbekende categorie '${dimension.category}'.`,
      });
    }

    const questionsForDimension = questions.filter(
      (question) => question.dimensionCode === dimension.code
    );

    if (dimension.isActive !== false && questionsForDimension.length === 0) {
      addMessage(messages, {
        type: "warning",
        source: "dimensions",
        reference: dimension.code,
        message: `Actieve dimensie '${dimension.code}' heeft nog geen gekoppelde vragen.`,
      });
    }
  });

  optionSets.forEach((optionSet) => {
    if (!optionSet.key?.trim()) {
      addMessage(messages, {
        type: "error",
        source: "optionSets",
        message: "Er is een option set zonder key.",
      });
    }

    if (!optionSet.options || optionSet.options.length === 0) {
      addMessage(messages, {
        type: "warning",
        source: "optionSets",
        reference: optionSet.key,
        message: `Option set '${optionSet.key}' heeft geen opties.`,
      });
    }

    const optionValues = optionSet.options.map((option) => option.value);
    const duplicateOptionValues = unique(hasDuplicateValues(optionValues));

    duplicateOptionValues.forEach((value) => {
      addMessage(messages, {
        type: "error",
        source: "optionSets",
        reference: optionSet.key,
        message: `Option set '${optionSet.key}' bevat dubbele waarde '${value}'.`,
      });
    });

    optionSet.options.forEach((option) => {
      if (!option.value?.trim()) {
        addMessage(messages, {
          type: "error",
          source: "optionSets",
          reference: optionSet.key,
          message: `Option set '${optionSet.key}' bevat een optie zonder value.`,
        });
      }

      if (!option.label?.trim()) {
        addMessage(messages, {
          type: "error",
          source: "optionSets",
          reference: optionSet.key,
          message: `Option set '${optionSet.key}' bevat optie '${option.value}' zonder label.`,
        });
      }

      if ("score" in option && typeof option.score !== "number") {
        addMessage(messages, {
          type: "error",
          source: "optionSets",
          reference: optionSet.key,
          message: `Option '${option.value}' in option set '${optionSet.key}' heeft een ongeldige score.`,
        });
      }
    });
  });

  questions.forEach((question) => {
    if (!question.key?.trim()) {
      addMessage(messages, {
        type: "error",
        source: "questions",
        message: "Er is een vraag zonder key.",
      });
    }

    if (!question.label?.trim()) {
      addMessage(messages, {
        type: "error",
        source: "questions",
        reference: question.key,
        message: `Vraag '${question.key}' heeft geen label.`,
      });
    }

    if (!question.sectionCode?.trim()) {
      addMessage(messages, {
        type: "error",
        source: "questions",
        reference: question.key,
        message: `Vraag '${question.key}' heeft geen sectionCode.`,
      });
    }

    if (question.dimensionCode && !dimensionCodes.includes(question.dimensionCode)) {
      addMessage(messages, {
        type: "error",
        source: "questions",
        reference: question.key,
        message: `Vraag '${question.key}' verwijst naar onbekende dimensie '${question.dimensionCode}'.`,
      });
    }

    if (question.category && !categoryCodes.includes(question.category)) {
      addMessage(messages, {
        type: "warning",
        source: "questions",
        reference: question.key,
        message: `Vraag '${question.key}' verwijst naar onbekende categorie '${question.category}'.`,
      });
    }

    if (question.optionSetKey && !optionSetKeys.includes(question.optionSetKey)) {
      addMessage(messages, {
        type: "error",
        source: "questions",
        reference: question.key,
        message: `Vraag '${question.key}' verwijst naar onbekende option set '${question.optionSetKey}'.`,
      });
    }

    if (question.scoreEnabled === true) {
      if (!question.dimensionCode) {
        addMessage(messages, {
          type: "error",
          source: "questions",
          reference: question.key,
          message: `Scorevraag '${question.key}' heeft geen dimensionCode.`,
        });
      }

      if (!question.optionSetKey) {
        addMessage(messages, {
          type: "warning",
          source: "questions",
          reference: question.key,
          message: `Scorevraag '${question.key}' heeft geen optionSetKey. Dan wordt alleen fallback-score gebruikt.`,
        });
      }

      if (question.outputRole && question.outputRole !== "score") {
        addMessage(messages, {
          type: "warning",
          source: "questions",
          reference: question.key,
          message: `Vraag '${question.key}' heeft scoreEnabled=true maar outputRole='${question.outputRole}'.`,
        });
      }
    }

    if (question.outputRole === "context" && question.scoreEnabled === true) {
      addMessage(messages, {
        type: "warning",
        source: "questions",
        reference: question.key,
        message: `Contextvraag '${question.key}' telt nu toch mee als score. Controleer of dit bewust is.`,
      });
    }
  });

  const errors = messages.filter((message) => message.type === "error");
  const warnings = messages.filter((message) => message.type === "warning");

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    messages,
  };
}
