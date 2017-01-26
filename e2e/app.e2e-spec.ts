import { BitkarBetaPage } from './app.po';

describe('bitkar-beta App', function() {
  let page: BitkarBetaPage;

  beforeEach(() => {
    page = new BitkarBetaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
