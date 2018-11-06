import { EscapeHtmlPipe } from "./components/graphic/sanitize.pipe";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { GraphicComponent } from "./components/graphic/graphic.component";
import { HttpClientModule } from "@angular/common/http";

@NgModule({
  declarations: [AppComponent, GraphicComponent, EscapeHtmlPipe],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
