import { test, expect } from '../../fixtures';
import { ProductListPage } from '../../pages/product/product-list.page';
import { buildProduct } from '../../utils/data-builders/product.builder';

test.describe('Edit Product', () => {
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

  test('productName is read-only once created', async () => {
    // The template also binds [disabled]="!isNewObject" alongside [readonly], but Angular's
    // reactive forms ignore a plain [disabled] attribute binding on a formControlName-bound
    // native input (the FormControl's own enable/disable state would be needed for that) - only
    // the [readonly] binding actually takes effect, which is what blocks editing here.
    await listPage.openEditDialog(productName);
    await expect(listPage.productNameInput).toHaveAttribute('readonly', '');
  });

  test('updating the free text persists the change', async () => {
    const updatedDescription = `E2E updated ${Date.now()}`;
    await listPage.openEditDialog(productName);
    await listPage.fillForm({ productDescription: updatedDescription });
    await listPage.submit();

    await expect(listPage.submitButton).toBeHidden();
    await expect(listPage.row(productName)).toContainText(updatedDescription, { timeout: 15_000 });
  });

  test('cancelling an edit discards changes', async () => {
    await listPage.openEditDialog(productName);
    await listPage.fillForm({ productDescription: 'SHOULD NOT SAVE' });
    await listPage.cancel();

    await expect(listPage.row(productName)).not.toContainText('SHOULD NOT SAVE');
  });
});
