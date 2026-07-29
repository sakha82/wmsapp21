import { test, expect } from '../../fixtures';
import { ProductListPage } from '../../pages/product/product-list.page';
import { buildProduct } from '../../utils/data-builders/product.builder';

test.describe('Delete Product', () => {
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

  // Product doesn't have a hard delete - the trash-can action soft-deletes by flipping
  // isActive, which the default "hide deleted products" filter then excludes from the list.
  test('deactivating a product removes it from the default (active-only) list', async () => {
    await listPage.toggleActiveStatus(productName);

    await expect(listPage.row(productName)).toHaveCount(0, { timeout: 15_000 });
  });

  test('unchecking "hide deleted products" reveals a deactivated product again', async () => {
    await listPage.toggleActiveStatus(productName);
    await expect(listPage.row(productName)).toHaveCount(0, { timeout: 15_000 });

    await listPage.hideDeletedProductsCheckbox.click();

    await expect(listPage.row(productName)).toBeVisible({ timeout: 15_000 });
  });
});
