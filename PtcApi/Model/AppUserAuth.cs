using System.Collections.Generic;

namespace PtcApi.Model
{
    public class AppUserAuth
    {
        public string UserName { get; set; } = "Not authorized";
        public string BearerToken { get; set; } = string.Empty;
        public bool IsAuthenticated { get; set; }
        public List<AppUserClaim> Claims { get; set; }
    }
}