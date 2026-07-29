import { test, expect } from '../../fixtures';
import { ProductListPage } from '../../pages/product/product-list.page';
import { buildProduct } from '../../utils/data-builders/product.builder';

test.describe('Create Product', () => {
  let listPage: ProductListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ProductListPage(page);
    await listPage.goto();
  });

  test('create dialog opens with the expected fields', async () => {
    await listPage.openCreateDialog();
    await expect(listPage.productNameInput).toBeVisible();
    await expect(listPage.submitButton).toBeVisible();
    await expect(listPage.cancelButton).toBeVisible();
  });

  test('submitting without a product name is rejected', async () => {
    await listPage.openCreateDialog();
    await listPage.submit();
    await expect(listPage.productNameInput).toHaveClass(/ng-invalid/);
    await expect(listPage.submitButton).toBeVisible();
  });

  test('cancel button closes the dialog without saving', async () => {
    await listPage.openCreateDialog();
    await listPage.fillForm(buildProduct());
    await listPage.cancel();
    await expect(listPage.submitButton).toBeHidden();
  });

  test('valid data creates the product and it appears in the list', async () => {
    const data = buildProduct();
    await listPage.openCreateDialog();
    await listPage.fillForm(data);
    await listPage.submit();

    await expect(listPage.toast).toContainText(/./);
    await expect(listPage.submitButton).toBeHidden();
    await listPage.searchFor(data.productName);
    await expect(listPage.row(data.productName)).toBeVisible({ timeout: 15_000 });
  });
});
