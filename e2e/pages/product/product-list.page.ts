import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { PrimeTableComponent } from '../components/prime-table.component';
import { ProductFormData } from '../../utils/data-builders/product.builder';
import { t } from '../../utils/translations';

export class ProductListPage extends BasePage {
  readonly table: PrimeTableComponent;
  readonly createProductButton: Locator;
  readonly hideDeletedProductsCheckbox: Locator;
  readonly searchInput: Locator;

  // Dialog
  readonly productNameInput: Locator;
  readonly productDescriptionInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new PrimeTableComponent(page, page.getByTestId('product-table'), 'product-row');
    this.createProductButton = page.getByTestId('create-product-button');
    this.hideDeletedProductsCheckbox = page.getByTestId('hide-deleted-products-checkbox');
    this.searchInput = page.getByTestId('product-search-input');

    this.productNameInput = page.locator('input[formcontrolname="productName"]');
    this.productDescriptionInput = page.locator('input[formcontrolname="productDescription"]');
    this.submitButton = page.getByTestId('product-submit-button');
    this.cancelButton = page.getByTestId('product-cancel-button');
    this.toast = page.locator('p-toast');
  }

  async goto(): Promise<void> {
    await super.goto('/sv/product');
  }

  row(productName: string): Locator {
    return this.table.rows.filter({ hasText: productName });
  }

  /**
   * The table isn't `[lazy]` - all products load client-side, sorted alphabetically by
   * productName - so a freshly created "E2E Product ..." row isn't guaranteed to land on page 1
   * once this dev environment has accumulated enough other products across runs. The header's
   * global-filter search box (client-side, searches the full loaded dataset) sidesteps that.
   */
  async searchFor(productName: string): Promise<void> {
    // The product dialog's p-selects (category/unit/vat) are torn down asynchronously when the
    // dialog closes; focusing the search input while that's still in flight races their internal
    // focus-state binding and throws a dev-mode NG0100 the quality fixture treats as blocking.
    // Waiting for the dialog mask to fully detach avoids the race.
    await this.page.locator('.p-dialog-mask').waitFor({ state: 'detached', timeout: 5_000 }).catch(() => {});
    await this.searchInput.fill(productName);
  }

  async openCreateDialog(): Promise<void> {
    await this.createProductButton.click();
  }

  async openEditDialog(productName: string): Promise<void> {
    await this.row(productName).getByTestId('edit-product-button').click();
  }

  async openProductDetail(productName: string): Promise<void> {
    await this.row(productName).locator('.pi-external-link').click();
    await this.waitForLoadingComplete();
  }

  /** Category/unit/vat/quantity/price all keep their form defaults - only productName is required. */
  async fillForm(data: Partial<ProductFormData>): Promise<void> {
    if (data.productName !== undefined) await this.productNameInput.fill(data.productName);
    if (data.productDescription !== undefined) await this.productDescriptionInput.fill(data.productDescription);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Opens the deactivate/reactivate confirm dialog for a row and confirms it. */
  async toggleActiveStatus(productName: string): Promise<void> {
    await this.row(productName).getByTestId('delete-product-button').click();
    await this.page.locator('.p-confirmdialog').getByRole('button', { name: t('yes'), exact: true }).click();
  }

  async toastText(): Promise<string> {
    return (await this.toast.innerText()).trim();
  }
}
