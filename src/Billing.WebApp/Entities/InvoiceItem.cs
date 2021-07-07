using System;

namespace Billing.WebApp.Entities
{
    public class InvoiceItem
    {
        public int Id { get; set; }
        public Invoice Invoice { get; set; }
        public int Order { get; set; }
        public int Quantity { get; set; }
        public float Price { get; set; }
        public string Description { get; set; }
        public int TaxAmount { get; set; }
        public bool TaxPercentage { get; set; } = true;
        public bool TaxInclusive { get; set; } = true;
        public DateTime Created { get; set; } = DateTime.Now;
        public DateTime Updated { get; set; } = DateTime.Now;

    }
}