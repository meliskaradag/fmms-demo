using Microsoft.AspNetCore.Mvc;

namespace FMMS.API.Controllers;

/// <summary>
/// Returns the list of known mobile app users so the web UI
/// can pick a technician when assigning work orders.
/// This is a lightweight, hardcoded list matching the mobile app's CURRENT_USER constants.
/// </summary>
[ApiController]
[Route("api/v1/mobile-users")]
public class MobileUsersController : ControllerBase
{
    private static readonly object[] Users =
    [
        new
        {
            userId   = "11111111-1111-1111-1111-111111111111",
            username = "Ahmet Yilmaz",
            email    = "ahmet@abc-avm.com",
            role     = "technician",
            tenant   = "abc-avm"
        },
        new
        {
            userId   = "22222222-2222-2222-2222-222222222222",
            username = "Mehmet Kara",
            email    = "mehmet@abc-avm.com",
            role     = "manager",
            tenant   = "abc-avm"
        }
    ];

    [HttpGet]
    public IActionResult GetAll() => Ok(Users);
}
