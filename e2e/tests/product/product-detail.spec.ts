import { test, expect } from '../../fixtures';
import { ProductListPage } from '../../pages/product/product-list.page';
import { buildProduct } from '../../utils/data-builders/product.builder';

test.describe('Product Detail', () => {
  let listPage: ProductListPage;
  let productName: string;

  test.beforeEach(async ({ page }) => {
    listPage = new ProductListPage(page);
    await listPage.goto();

    const data = buildProduct();
    productName = data.productName;
    await listPage.openCreateDialog();
    await listPage.fillForm(data);
    await listPage.submit();
    await listPage.searchFor(productName);
    await expect(listPage.row(productName)).toBeVisible({ timeout: 15_000 });
  });

  test('opening a product from the list navigates to its detail page', async ({ page }) => {
    await listPage.openProductDetail(productName);
    await expect(page).toHaveURL(/\/sv\/product\/details\/\d+/);
    await expect(page.locator('body')).toContainText(productName);
  });

  test('sale history table is present', async ({ page }) => {
    await listPage.openProductDetail(productName);
    await expect(page.getByTestId('sale-history-table')).toBeVisible();
  });
});
