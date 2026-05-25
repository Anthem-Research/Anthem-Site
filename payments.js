const paymentLinks = {
  supporter: "mailto:hello@anthemresearch.xyz?subject=Supporter%20payment%20link",
  journal: "mailto:hello@anthemresearch.xyz?subject=Journal%20payment%20link",
  research: "mailto:hello@anthemresearch.xyz?subject=Research%20payment%20link"
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-payment-tier]").forEach((link) => {
    const tier = link.getAttribute("data-payment-tier");
    if (paymentLinks[tier]) {
      link.href = paymentLinks[tier];
    }
  });
});
