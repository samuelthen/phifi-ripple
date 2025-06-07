import CreateAccountForm from '@/components/forms/CreateAccountForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            PhiFi
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Decentralized donation and impact tracking platform built on the XRP Ledger
          </p>
        </div>

        <div className="mt-12">
          <CreateAccountForm />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">For Donors</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create a wallet, donate testnet XRP to verified NGOs, receive NFT receipts, and track impact.
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">For NGOs</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create a wallet, receive donations, and simulate fund disbursements to verified recipients.
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Transparency</h3>
              <p className="mt-2 text-sm text-gray-500">
                Track every donation and its impact through the XRP Ledger's transparent and immutable nature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
