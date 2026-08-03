import {
  Category,
  Model,
  ProductSeries,
  Variant,
  VariantStructure,
} from "./types";

/**
 * Builds a VariantStructure record by cross-referencing variant with
 * category, series, and model lookup arrays.
 */
export function buildVariantStructureFromVariant(
  variant: Variant,
  categories: Category[],
  series: ProductSeries[],
  models: Model[],
  id: string,
): VariantStructure {
  const category = categories.find((c) => c.id === variant.categoryId);
  const seriesItem = series.find((s) => s.id === variant.seriesId);
  const model = models.find((m) => m.id === variant.modelId);

  return {
    id,
    variantId: variant.id,
    variantCode: variant.variantCode,
    categoryCode: category?.code ?? "",
    categoryName: category?.categoryName ?? "",
    seriesCode: seriesItem?.seriesCode ?? "",
    seriesName: seriesItem?.seriesName ?? "",
    modelCode: model?.modelCode ?? "",
    modelName: model?.modelName ?? "",
    capacity: model?.capacity ?? "",
    axleType: model?.axleType ?? "",
    bodyLength: model?.length ?? "",
    bodyWidth: model?.width ?? "",
    bodyHeight: model?.height ?? "",
    standardWeight: model?.standardWeight ?? "",
    bodyType: variant.bodyType ?? "",
    axleBrand: variant.axleBrand ?? "",
    hydraulicBrand: variant.hydraulicBrand ?? "",
    tyreBrand: variant.tyreBrand ?? "",
    targetCost: variant.targetCost ?? "",
    sellingMarkup: variant.sellingPrice ?? "",
  };
}
